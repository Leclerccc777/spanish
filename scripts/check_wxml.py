"""结构检查：忽略 WXML 绑定表达式，兼容 wx:else 布尔属性。

不是微信官方编译器，不检查表达式、组件语义或 WXSS 行为。
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1] / 'miniprogram' / 'pages'
files = list(root.rglob('*.wxml'))
for file in files:
    source = file.read_text(encoding='utf-8')
    source = re.sub(r'\{\{.*?\}\}', 'binding', source, flags=re.S)
    source = re.sub(r'\bwx:else(?=\s|>)', 'wx:else="true"', source)
    source = source.replace('wx:', 'wx_')
    try:
        ET.fromstring('<root>' + source + '</root>')
    except ET.ParseError as error:
        raise ValueError(f'{file.relative_to(root)}: {error}') from error
print(f'{len(files)} WXML templates passed tag / attribute structure checks (not WeChat compilation).')
