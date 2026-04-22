# Creon Design System

> Based on [Seed Design System](https://github.com/daangn/seed-design) by Daangn.
> Primary color remapped: **carrot(orange) → blue**.
> This file is the single source of truth for all UI decisions in this project.

---

## 1. Color Tokens

### Scale Colors — Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--color-blue-50` | `#EBF7FA` | 배경 강조, 선택 영역 |
| `--color-blue-100` | `#D2EDFA` | hover 배경 |
| `--color-blue-200` | `#B9E3FA` | active 배경 |
| `--color-blue-300` | `#87D7FF` | |
| `--color-blue-400` | `#57C7FF` | |
| `--color-blue-500` | `#009CEB` | **Primary** |
| `--color-blue-600` | `#0088CC` | hover |
| `--color-blue-700` | `#0077B2` | pressed |
| `--color-blue-800` | `#006199` | |
| `--color-blue-900` | `#004C73` | |
| `--color-blue-950` | `#003B59` | |
| `--color-gray-00` | `#ffffff` | |
| `--color-gray-50` | `#f7f8fa` | 배경 |
| `--color-gray-100` | `#f2f3f6` | hover 배경 |
| `--color-gray-200` | `#eaebee` | border |
| `--color-gray-300` | `#dcdee3` | divider |
| `--color-gray-400` | `#d1d3d8` | |
| `--color-gray-500` | `#adb1ba` | placeholder |
| `--color-gray-600` | `#868b94` | secondary text |
| `--color-gray-700` | `#4d5159` | |
| `--color-gray-800` | `#393A40` | |
| `--color-gray-900` | `#212124` | primary text |
| `--color-red-500` | `#FF4133` | danger |
| `--color-red-600` | `#FA2314` | danger hover |
| `--color-green-500` | `#1AA174` | success |
| `--color-yellow-400` | `#DEA651` | warning |

### Scale Colors — Dark Mode

| Token | Value |
|-------|-------|
| `--color-blue-500` | `#079AE3` |
| `--color-blue-600` | `#5EC4F7` |
| `--color-gray-00` | `#17171a` |
| `--color-gray-50` | `#212124` |
| `--color-gray-100` | `#2b2e33` |
| `--color-gray-200` | `#34373d` |
| `--color-gray-300` | `#43474f` |
| `--color-gray-900` | `#eaebee` |

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-primary` | `#009CEB` | `#079AE3` | 주요 액션, CTA 버튼 |
| `--color-primary-low` | `#009CEB24` | `#079AE31a` | primary 배경 약하게 |
| `--color-primary-hover` | `#57C7FF` | `#5EC4F7` | 버튼 hover |
| `--color-primary-pressed` | `#0088CC` | `#0077B2` | 버튼 pressed |
| `--color-on-primary` | `#ffffff` | `#ffffff` | primary 위 텍스트 |
| `--color-secondary` | `#212124` | `#eaebee` | 보조 액션 |
| `--color-success` | `#1AA174` | `#1E9C72` | 성공 상태 |
| `--color-warning` | `#DEA651` | `#F0BB6C` | 경고 상태 |
| `--color-danger` | `#FA2314` | `#F2291B` | 오류/삭제 |
| `--color-danger-low` | `#FF41330d` | `#F746390d` | danger 배경 약하게 |
| `--color-ink-text` | `#212124` | `#eaebee` | 본문 텍스트 |
| `--color-ink-text-low` | `#868b94` | `#868b94` | 보조 텍스트 |
| `--color-paper-background` | `#f2f3f6` | `#17171a` | 앱 배경 |
| `--color-paper-default` | `#ffffff` | `#212124` | 카드/패널 배경 |
| `--color-paper-contents` | `#f7f8fa` | `#17171a` | 콘텐츠 영역 배경 |
| `--color-paper-dialog` | `#ffffff` | `#2b2e33` | 모달/다이얼로그 배경 |
| `--color-divider-1` | `#0017580d` | `#ffffff0d` | 가장 옅은 구분선 |
| `--color-divider-2` | `#eaebee` | `#34373d` | 기본 구분선 |
| `--color-overlay-dim` | `#00000080` | `#00000080` | 모달 오버레이 |

### Alpha Colors

| Token | Light | Dark |
|-------|-------|------|
| `--color-blue-alpha-50` | `#009CEB0d` | `#079AE30d` |
| `--color-blue-alpha-100` | `#009CEB1a` | `#079AE31a` |
| `--color-blue-alpha-200` | `#009CEB33` | `#079AE333` |
| `--color-gray-alpha-50` | `#0017580d` | `#ffffff0d` |
| `--color-gray-alpha-200` | `#19233e33` | `#ffffff33` |

---

## 2. Typography

### Scale

| Level | Size (px) | rem |
|-------|-----------|-----|
| font-10 | 10px | 0.625rem |
| font-50 | 12px | 0.75rem |
| font-75 | 13px | 0.8125rem |
| font-100 | 14px | 0.875rem |
| font-150 | 15px | 0.9375rem |
| font-200 | 16px | 1rem |
| font-300 | 18px | 1.125rem |
| font-400 | 20px | 1.25rem |
| font-500 | 24px | 1.5rem |
| font-600 | 26px | 1.625rem |
| font-700 | 32px | 2rem |

### Semantic Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `h1` | 48px | bold | 135% | 페이지 대제목 |
| `h2` | 42px | bold | 135% | 섹션 제목 |
| `h3` | 34px | bold | 135% | |
| `h4` | 26px | bold | 135% | |
| `title1` | 24px | bold/regular | 135% | 카드 제목 |
| `title2` | 20px | bold/regular | 135% | |
| `title3` | 18px | bold/regular | 135% | |
| `subtitle1` | 16px | bold/regular | 135% | 라벨, 소제목 |
| `subtitle2` | 14px | bold/regular | 135% | |
| `bodyL1` | 16px | bold/regular | 150% | 본문 (넉넉한 간격) |
| `bodyL2` | 14px | bold/regular | 150% | 본문 보조 |
| `caption1` | 13px | bold/regular | 150% | 캡션, 설명 |
| `caption2` | 12px | bold/regular | 135% | 태그, 뱃지 텍스트 |
| `label3` | 14px | bold/regular | 135% | 버튼 레이블 |
| `label4` | 12px | bold/regular | 135% | 작은 버튼 레이블 |

### Font Weight

| Name | Value |
|------|-------|
| regular | `normal` (400) |
| bold | `bold` (700) |

---

## 3. Spacing

표준 간격은 **4px 베이스 그리드**를 따릅니다.

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-1` | 4px | 아이콘 내부 패딩 |
| `--spacing-2` | 8px | 작은 요소 간 간격 |
| `--spacing-3` | 12px | 컴팩트 패딩 |
| `--spacing-4` | 16px | 기본 패딩 |
| `--spacing-5` | 24px | 섹션 내 간격 (Seed 표준 마진) |
| `--spacing-6` | 32px | 섹션 간 간격 |
| `--spacing-7` | 48px | 큰 섹션 간격 |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | 작은 태그, 뱃지 |
| `--radius-md` | 8px | 버튼, 인풋 |
| `--radius-lg` | 12px | 카드, 패널 |
| `--radius-xl` | 16px | 모달, 바텀시트 |
| `--radius-full` | 9999px | 알약형 버튼, 아바타 |

---

## 5. Shadow

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.06)` | 카드 |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.10)` | 드롭다운, 툴팁 |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.14)` | 모달 |

---

## 6. Component Guidelines

### Button

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `fill/primary` | `--color-primary` | `--color-on-primary` | none |
| `fill/danger` | `--color-danger` | white | none |
| `weak/primary` | `--color-primary-low` | `--color-primary` | none |
| `weak/gray` | `--color-paper-contents` | `--color-ink-text` | none |
| `outline` | transparent | `--color-ink-text` | `--color-divider-2` |

Sizes: `xlarge`(52px h), `large`(48px h), `medium`(40px h), `small`(32px h), `xsmall`(28px h)
Border radius: `--radius-md` 기본, pill 형태는 `--radius-full`

### Badge

Sizes: `large`(24px h), `medium`(20px h), `small`(16px h), `xsmall`(14px h)
Variants: `fill` (solid background), `weak` (alpha background)
Colors: `blue`(primary), `gray`, `red`, `green`, `yellow`

### Input / Textarea

- Height: 40px (medium), 48px (large)
- Background: `--color-paper-default`
- Border: `1px solid --color-divider-2`
- Border (focus): `1px solid --color-primary`
- Border radius: `--radius-md`
- Placeholder: `--color-ink-text-low`

### Card

- Background: `--color-paper-default`
- Border: `1px solid --color-divider-2` 또는 shadow
- Border radius: `--radius-lg`
- Padding: `--spacing-4` ~ `--spacing-5`

### Modal / Dialog

- Background: `--color-paper-dialog`
- Border radius: `--radius-xl`
- Overlay: `--color-overlay-dim`
- Shadow: `--shadow-lg`

### Divider

- `divider-1`: 매우 옅은 구분 (리스트 아이템 사이)
- `divider-2`: 기본 구분선
- `divider-3`: 강조 구분선

---

## 7. Interaction States

| State | Effect |
|-------|--------|
| hover | `--color-primary-hover` 또는 `--color-gray-hover` 배경 |
| pressed/active | `--color-primary-pressed` 또는 `--color-gray-pressed` |
| disabled | opacity 0.38, pointer-events none |
| focus | `outline: 2px solid --color-primary`, offset 2px |

---

## 8. Dark Mode

`[data-theme="dark"]` 또는 `@media (prefers-color-scheme: dark)` 에서
모든 `--color-*` 시맨틱 토큰이 자동으로 다크 값으로 전환됩니다.

---

## 9. Rules for New Pages & Components

이 프로젝트에서 UI를 작성할 때 반드시 지켜야 할 규칙:

1. **색상은 반드시 시맨틱 토큰 사용** — hex 직접 입력 금지
   - `color: #009CEB` ❌ → `color: var(--color-primary)` ✅
2. **spacing은 토큰 사용** — `margin: 13px` ❌ → `var(--spacing-3)` ✅
3. **primary 색상은 blue** — orange/carrot 계열 사용 금지
4. **버튼은 fill/weak/outline 3가지 variant만 사용**
5. **폰트 크기는 typography scale 준수** — 임의 크기 금지
6. **다크모드 대응** — 모든 색상은 CSS 변수로만 지정
7. **border-radius는 토큰 사용** — `--radius-sm/md/lg/xl/full`
