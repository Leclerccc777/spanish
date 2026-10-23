"""Update an existing APK's web assets/version; align and re-sign the output separately.

Use only when native classes/resources are unchanged. Refuses to resize the
binary manifest string pool. Normal native changes require the Gradle build.
"""
import argparse
from pathlib import Path
import struct
import zipfile


def update_manifest(data, version_name, version_code):
    data = bytearray(data)
    strings, positions = [], []
    offset = 8
    changed = set()
    while offset < len(data):
        kind, header, size = struct.unpack_from('<HHI', data, offset)
        if not size or offset + size > len(data):
            raise ValueError('Invalid binary manifest chunk')
        if kind == 1:
            count, _, flags, start = struct.unpack_from('<IIII', data, offset + 8)
            utf8 = bool(flags & 0x100)
            def length(pos, wide=False):
                if wide:
                    value = struct.unpack_from('<H', data, pos)[0]
                    return (((value & 0x7fff) << 16) | struct.unpack_from('<H', data, pos + 2)[0], pos + 4) if value & 0x8000 else (value, pos + 2)
                value = data[pos]
                return (((value & 0x7f) << 8) | data[pos + 1], pos + 2) if value & 0x80 else (value, pos + 1)
            for index in range(count):
                pos = offset + start + struct.unpack_from('<I', data, offset + header + index * 4)[0]
                chars, pos = length(pos, not utf8)
                if utf8:
                    size_bytes, pos = length(pos)
                    encoding = 'utf-8'
                else:
                    size_bytes, encoding = chars * 2, 'utf-16le'
                strings.append(bytes(data[pos:pos + size_bytes]).decode(encoding))
                positions.append((pos, size_bytes, encoding))
        elif kind == 0x102:
            name = struct.unpack_from('<I', data, offset + 20)[0]
            attr_start, attr_size, count = struct.unpack_from('<HHH', data, offset + 24)
            if strings[name] == 'manifest':
                for index in range(count):
                    attr = offset + 16 + attr_start + index * attr_size
                    key = strings[struct.unpack_from('<I', data, attr + 4)[0]]
                    value_type, value = data[attr + 15], struct.unpack_from('<I', data, attr + 16)[0]
                    if key == 'versionCode':
                        if value_type != 0x10 or version_code <= value:
                            raise ValueError('Expected an increasing integer versionCode')
                        struct.pack_into('<I', data, attr + 16, version_code)
                        changed.add(key)
                    elif key == 'versionName':
                        if value_type != 3:
                            raise ValueError('Expected string versionName')
                        pos, size_bytes, encoding = positions[value]
                        replacement = version_name.encode(encoding)
                        if len(replacement) != size_bytes:
                            raise ValueError('Use Gradle when versionName changes encoded length')
                        data[pos:pos + size_bytes] = replacement
                        changed.add(key)
        offset += size
    if changed != {'versionCode', 'versionName'}:
        raise ValueError('Version attributes were not found')
    return bytes(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('html', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--version-name', required=True)
    parser.add_argument('--version-code', required=True, type=int)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        raise ValueError('Output must be separate from the source APK')
    html = args.html.read_bytes()
    with zipfile.ZipFile(args.source) as source, zipfile.ZipFile(args.output, 'w') as output:
        required = {'AndroidManifest.xml', 'assets/index.html', 'classes.dex'}
        if not required.issubset(source.namelist()):
            raise ValueError('Not a supported Hola APK')
        for info in source.infolist():
            if info.filename.startswith('META-INF/') and info.filename.upper().endswith(('.RSA', '.DSA', '.EC', '.SF', 'MANIFEST.MF')):
                continue
            content = source.read(info.filename)
            if info.filename == 'AndroidManifest.xml':
                content = update_manifest(content, args.version_name, args.version_code)
            elif info.filename == 'assets/index.html':
                content = html
            output.writestr(info, content)
    print('Updated assets and manifest; output must be aligned and signed before installation.')


if __name__ == '__main__':
    main()
