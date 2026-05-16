# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 環境

- Python 3.9（`.venv/` に仮想環境あり）
- インストール済みパッケージ: numpy, pandas

仮想環境を使う場合:
```
source .venv/bin/activate
python <script>.py
```

仮想環境なしで直接実行:
```
.venv/bin/python <script>.py
```

パッケージ追加:
```
.venv/bin/pip install <package>
```

## ディレクトリ構成

- `selfpy/chap01〜chap11/` — Python学習教材（ISBN: 978-4-7981-5112-0）の章別演習コード
- `index.html` + `main.js` — ブラウザで動くブロック崩しゲーム（Canvas API）
- `htmlperser.py` — Google ニュースRSSを取得して表示するスクリプト（BeautifulSoup使用）
- `kindle.csv` — Kindleデータ（pandasで読み込む想定）

## ローカルサーバー起動

Node.js（npx）が使えない場合はPythonで起動:
```
python3 -m http.server 8080
```
→ http://localhost:8080 でindex.htmlを確認可能
