// Exact public font assets observed on 2026-10-11. Only SIL OFL fonts are fetched.
// Pin both the original bytes and SHA-256: newer font releases can render differently.
// Paths are site-relative; bundle each referenced license alongside the font files.
export const FONT_ASSETS = [
  {
    "family": "Open Runde",
    "weight": "400",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/open-runde/OpenRunde-Regular.woff2",
    "path": "fonts/open-runde/OpenRunde-Regular.woff2",
    "sha256": "da42a03569a63e4ae09ea2943bd530fce8bbf72ea4609618232c86f54c705e76",
    "bytes": 154604,
    "licensePath": "fonts/licenses/OpenRunde-OFL.txt"
  },
  {
    "family": "Open Runde",
    "weight": "500",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/open-runde/OpenRunde-Medium.woff2",
    "path": "fonts/open-runde/OpenRunde-Medium.woff2",
    "sha256": "169d786a5984c8a9d6f5ee4b019ae882a3a2e9896a44e2c28f8d5b9bab12555e",
    "bytes": 165396,
    "licensePath": "fonts/licenses/OpenRunde-OFL.txt"
  },
  {
    "family": "Open Runde",
    "weight": "600",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/open-runde/OpenRunde-Semibold.woff2",
    "path": "fonts/open-runde/OpenRunde-Semibold.woff2",
    "sha256": "51bb1591ab0b4b4c423165ce00b424293e0d87839a3b22027077b03323c097ae",
    "bytes": 162732,
    "licensePath": "fonts/licenses/OpenRunde-OFL.txt"
  },
  {
    "family": "Open Runde",
    "weight": "700",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/open-runde/OpenRunde-Bold.woff2",
    "path": "fonts/open-runde/OpenRunde-Bold.woff2",
    "sha256": "9a64eabe53890050c4606ca2def75c0f7b78e5bfb1e45b1ee59951f30ceae79a",
    "bytes": 162468,
    "licensePath": "fonts/licenses/OpenRunde-OFL.txt"
  },
  {
    "family": "LT Superior Serif",
    "weight": "400",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/lt-superior-serif/LTSuperiorSerif-Regular.woff",
    "path": "fonts/lt-superior-serif/LTSuperiorSerif-Regular.woff",
    "sha256": "22c61752316f2d5f9543f80f7aee65ad392749698b84293a38d1353bc7f4c920",
    "bytes": 86304,
    "licensePath": "fonts/licenses/LTSuperiorSerif-OFL.txt"
  },
  {
    "family": "LT Superior Serif",
    "weight": "500",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/lt-superior-serif/LTSuperiorSerif-Medium.woff",
    "path": "fonts/lt-superior-serif/LTSuperiorSerif-Medium.woff",
    "sha256": "fef6616dec6a56a982a2f643a3d7f73d0ec9f61bf1eeb5644bc15a11e33bc80b",
    "bytes": 89964,
    "licensePath": "fonts/licenses/LTSuperiorSerif-OFL.txt"
  },
  {
    "family": "LT Superior Serif",
    "weight": "600",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/lt-superior-serif/LTSuperiorSerif-Semibold.woff",
    "path": "fonts/lt-superior-serif/LTSuperiorSerif-Semibold.woff",
    "sha256": "cb7f90d5384ceedc1c04350d3957943ab7b233b2c31beff27c7170b4a30a9a43",
    "bytes": 87932,
    "licensePath": "fonts/licenses/LTSuperiorSerif-OFL.txt"
  },
  {
    "family": "LT Superior Serif",
    "weight": "700",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/lt-superior-serif/LTSuperiorSerif-Bold.woff",
    "path": "fonts/lt-superior-serif/LTSuperiorSerif-Bold.woff",
    "sha256": "8722efde68b68eab1cf0e60a2d25409531eed1218f3019a22c119992d6e3ab50",
    "bytes": 88688,
    "licensePath": "fonts/licenses/LTSuperiorSerif-OFL.txt"
  },
  {
    "family": "LT Superior Serif",
    "weight": "800",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/lt-superior-serif/LTSuperiorSerif-ExtraBold.woff",
    "path": "fonts/lt-superior-serif/LTSuperiorSerif-ExtraBold.woff",
    "sha256": "9c58dfff396d875431f1257dd24da92480cdd2df68bc5a26294e626fc14fd29e",
    "bytes": 87048,
    "licensePath": "fonts/licenses/LTSuperiorSerif-OFL.txt"
  },
  {
    "family": "Sidebar Inter",
    "weight": "100 900",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/sidebar-study/inter.woff2",
    "path": "fonts/sidebar-study/inter.woff2",
    "sha256": "abd9798a9146544f5819209f96f47597b4b70573693b845ffb14b246ed3842ca",
    "bytes": 352696,
    "licensePath": "fonts/licenses/Inter-OFL.txt"
  },
  {
    "family": "Sidebar Geist",
    "weight": "100 900",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/sidebar-study/geist.woff2",
    "path": "fonts/sidebar-study/geist.woff2",
    "sha256": "2ea87444272fb050569a7887e5de0ba642c83a1c437cb4d09c2330165a050c6f",
    "bytes": 69644,
    "licensePath": "fonts/licenses/Geist-OFL.txt"
  },
  {
    "family": "Sidebar Geist Mono",
    "weight": "100 900",
    "style": "normal",
    "url": "https://www.graphicalui.com/fonts/sidebar-study/geist-mono.woff2",
    "path": "fonts/sidebar-study/geist-mono.woff2",
    "sha256": "b7ac144b394cbd81052d6397ec0c33397977b1d7e9bc095e744e652a378c6fb3",
    "bytes": 31288,
    "licensePath": "fonts/licenses/Geist-OFL.txt"
  }
];

// Optional user-supplied fonts. These are never downloaded by the build pipeline.
// GT fonts require an appropriate license; Timeless permits use but prohibits public
// repository redistribution. Keep files at these paths private and out of source control.
// Local aliases are candidate installed names derived from the public CSS/file names;
// exact PostScript names can vary by licensed release. Timeless family metadata was read.
export const LICENSED_FONT_FACES = [
  {
    "family": "GT Standard L",
    "weight": "400",
    "style": "normal",
    "localAliases": [
      "GT-Standard-L-Standard-Regular",
      "GT Standard L Standard Regular",
      "GT Standard L Regular",
      "GTStandardL-Regular",
      "GT Standard L"
    ],
    "path": "fonts/licensed/gt-standard-l/GT-Standard-L-Standard-Regular.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard L",
    "weight": "500",
    "style": "normal",
    "localAliases": [
      "GT-Standard-L-Standard-Medium",
      "GT Standard L Standard Medium",
      "GT Standard L Medium",
      "GTStandardL-Medium"
    ],
    "path": "fonts/licensed/gt-standard-l/GT-Standard-L-Standard-Medium.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard L",
    "weight": "600",
    "style": "normal",
    "localAliases": [
      "GT-Standard-L-Standard-Semibold",
      "GT Standard L Standard Semibold",
      "GT Standard L Semibold",
      "GTStandardL-Semibold"
    ],
    "path": "fonts/licensed/gt-standard-l/GT-Standard-L-Standard-Semibold.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "300",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Light",
      "GT Standard M Standard Light",
      "GT Standard M Light",
      "GTStandardM-Light"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Light.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "400",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Regular",
      "GT Standard M Standard Regular",
      "GT Standard M Regular",
      "GTStandardM-Regular",
      "GT Standard M"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Regular.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "500",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Medium",
      "GT Standard M Standard Medium",
      "GT Standard M Medium",
      "GTStandardM-Medium"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Medium.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "600",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Semibold",
      "GT Standard M Standard Semibold",
      "GT Standard M Semibold",
      "GTStandardM-Semibold"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Semibold.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "700",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Bold",
      "GT Standard M Standard Bold",
      "GT Standard M Bold",
      "GTStandardM-Bold"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Bold.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "800",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Heavy",
      "GT Standard M Standard Heavy",
      "GT Standard M Heavy",
      "GTStandardM-Heavy"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Heavy.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Standard M",
    "weight": "900",
    "style": "normal",
    "localAliases": [
      "GT-Standard-M-Standard-Black",
      "GT Standard M Standard Black",
      "GT Standard M Black",
      "GTStandardM-Black"
    ],
    "path": "fonts/licensed/gt-standard-m/GT-Standard-M-Standard-Black.woff2",
    "format": "woff2"
  },
  {
    "family": "GT America",
    "weight": "100 900",
    "style": "normal",
    "localAliases": [
      "GT-America-LCG-VF",
      "GT America LCG VF",
      "GT America"
    ],
    "path": "fonts/licensed/gt-america/GT-America-LCG-VF.woff2",
    "format": "woff2",
    "stretch": "50% 150%"
  },
  {
    "family": "GT Maru",
    "weight": "300",
    "style": "normal",
    "localAliases": [
      "GT-Maru-Light",
      "GT Maru Light"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Light.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "400",
    "style": "normal",
    "localAliases": [
      "GT-Maru-Regular",
      "GT Maru Regular",
      "GT Maru"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Regular.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "500",
    "style": "normal",
    "localAliases": [
      "GT-Maru-Medium",
      "GT Maru Medium"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Medium.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "700",
    "style": "normal",
    "localAliases": [
      "GT-Maru-Bold",
      "GT Maru Bold"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Bold.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "900",
    "style": "normal",
    "localAliases": [
      "GT-Maru-Black",
      "GT Maru Black"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Black.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "300",
    "style": "oblique",
    "localAliases": [
      "GT-Maru-Light-Oblique",
      "GT Maru Light Oblique"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Light-Oblique.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "400",
    "style": "oblique",
    "localAliases": [
      "GT-Maru-Regular-Oblique",
      "GT Maru Regular Oblique"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Regular-Oblique.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "500",
    "style": "oblique",
    "localAliases": [
      "GT-Maru-Medium-Oblique",
      "GT Maru Medium Oblique"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Medium-Oblique.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "700",
    "style": "oblique",
    "localAliases": [
      "GT-Maru-Bold-Oblique",
      "GT Maru Bold Oblique"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Bold-Oblique.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Maru",
    "weight": "900",
    "style": "oblique",
    "localAliases": [
      "GT-Maru-Black-Oblique",
      "GT Maru Black Oblique"
    ],
    "path": "fonts/licensed/gt-maru/GT-Maru-Black-Oblique.woff2",
    "format": "woff2"
  },
  {
    "family": "GT Super Text",
    "weight": "350",
    "style": "normal",
    "localAliases": [
      "GT-Super-Text-Book",
      "GT Super Text Book"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Book.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "400",
    "style": "normal",
    "localAliases": [
      "GT-Super-Text-Regular",
      "GT Super Text Regular",
      "GT Super Text"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Regular.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "500",
    "style": "normal",
    "localAliases": [
      "GT-Super-Text-Medium",
      "GT Super Text Medium"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Medium.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "700",
    "style": "normal",
    "localAliases": [
      "GT-Super-Text-Bold",
      "GT Super Text Bold"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Bold.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "900",
    "style": "normal",
    "localAliases": [
      "GT-Super-Text-Black",
      "GT Super Text Black"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Black.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "350",
    "style": "italic",
    "localAliases": [
      "GT-Super-Text-Book-Italic",
      "GT Super Text Book Italic"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Book-Italic.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "400",
    "style": "italic",
    "localAliases": [
      "GT-Super-Text-Regular-Italic",
      "GT Super Text Regular Italic"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Regular-Italic.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "500",
    "style": "italic",
    "localAliases": [
      "GT-Super-Text-Medium-Italic",
      "GT Super Text Medium Italic"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Medium-Italic.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "700",
    "style": "italic",
    "localAliases": [
      "GT-Super-Text-Bold-Italic",
      "GT Super Text Bold Italic"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Bold-Italic.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "GT Super Text",
    "weight": "900",
    "style": "italic",
    "localAliases": [
      "GT-Super-Text-Black-Italic",
      "GT Super Text Black Italic"
    ],
    "path": "fonts/licensed/gt-super-text/GT-Super-Text-Black-Italic.woff2",
    "format": "woff2",
    "featureSettings": "\"lnum\""
  },
  {
    "family": "Timeless Grotesk",
    "weight": "300 800",
    "style": "normal",
    "localAliases": [
      "TimelessSans-GroteskVF",
      "TimelessSans GroteskVF",
      "Timeless Sans Grotesk",
      "Timeless Sans Grotesk Light"
    ],
    "path": "fonts/licensed/timeless/TimelessSans-GroteskVF.woff2",
    "format": "woff2"
  },
  {
    "family": "Timeless Grotesk",
    "weight": "300 800",
    "style": "italic",
    "localAliases": [
      "TimelessSans-GroteskItalicVF",
      "TimelessSans GroteskItalicVF",
      "Timeless Sans Grotesk Italic",
      "Timeless Sans Grotesk Light Italic"
    ],
    "path": "fonts/licensed/timeless/TimelessSans-GroteskItalicVF.woff2",
    "format": "woff2"
  }
];
