"""Pretendard 가변 폰트를 두 파일로 나눠 줄인다.

- main: 영문·숫자·기본 문장부호 + 저장소 텍스트(content/, app/, components/, lib/)에
  실제로 쓰인 글자. 모든 페이지에서 미리 불러온다(preload).
- ext:  나머지 KS X 1001 완성형 한글(2,350자 중 main에 없는 글자)과 문장부호·기호.
  미리 불러오지 않는다. 페이지에 main에 없는 글자가 있을 때만 브라우저가 내려받는다.

main이 작을수록 모바일 LCP가 빨라진다(ARCHITECTURE §12). 콘텐츠에 새 글자가 늘어도
ext가 받쳐 주므로 화면은 깨지지 않지만, 가끔 이 스크립트를 다시 돌려 main을 갱신한다.
KS X 1001 밖의 드문 한글(예: 똠, 햏)은 시스템 폰트로 대체된다.

사용법 (fonttools, brotli 필요):
    python -m pip install fonttools brotli
    python scripts/subset-font.py
"""

from pathlib import Path

from fontTools import subset
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
FONT_DIR = ROOT / "app/fonts"
SCAN_DIRS = ["content", "app", "components", "lib"]
SCAN_SUFFIXES = {".ts", ".tsx", ".mdx", ".md", ".yaml", ".yml", ".css"}
# 코드에서 쓰는 굵기: 400(본문)·500·600·700·800. 범위를 좁히면 용량이 준다.
WEIGHT_RANGE = (400, 800)


def ks_x_1001_hangul() -> set[int]:
    chars: set[int] = set()
    for lead in range(0xB0, 0xC9):
        for trail in range(0xA1, 0xFF):
            try:
                chars.add(ord(bytes([lead, trail]).decode("euc-kr")))
            except UnicodeDecodeError:
                pass
    return chars


def code_points(*ranges: tuple[int, int]) -> set[int]:
    return {c for start, end in ranges for c in range(start, end + 1)}


BASIC_LATIN = code_points((0x0020, 0x007E))
EXTRA_SYMBOLS = code_points(
    (0x00A0, 0x00FF),  # Latin-1 Supplement
    (0x2010, 0x205E),  # General Punctuation
    (0x2190, 0x21FF),  # Arrows
    (0x2460, 0x24FF),  # Enclosed Alphanumerics (①)
    (0x3000, 0x303F),  # CJK Symbols and Punctuation (「」)
    (0x3131, 0x318E),  # Hangul Compatibility Jamo
    (0xFF01, 0xFF5E),  # Fullwidth forms
) | {0x20A9, 0x2122, 0x25CF, 0x25CB, 0x2713}


def used_chars() -> set[int]:
    chars: set[int] = set()
    for directory in SCAN_DIRS:
        for path in (ROOT / directory).rglob("*"):
            if path.suffix in SCAN_SUFFIXES and path.is_file():
                chars.update(ord(c) for c in path.read_text(encoding="utf-8"))
    return {c for c in chars if c >= 0x20}


def build(unicodes: set[int], output: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.drop_tables += ["DSIG"]

    font = subset.load_font(str(SOURCE), options, lazy=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(unicodes))
    subsetter.subset(font)
    font = instancer.instantiateVariableFont(font, {"wght": WEIGHT_RANGE})
    subset.save_font(font, str(output), options)
    size = output.stat().st_size / 1024
    print(f"{output.relative_to(ROOT)}: {len(unicodes)}자, {size:.0f}KB")


def main() -> None:
    main_chars = BASIC_LATIN | used_chars()
    ext_chars = (EXTRA_SYMBOLS | ks_x_1001_hangul()) - main_chars
    build(main_chars, FONT_DIR / "PretendardVariable.main.woff2")
    build(ext_chars, FONT_DIR / "PretendardVariable.ext.woff2")


if __name__ == "__main__":
    main()
