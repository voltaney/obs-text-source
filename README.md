# texteffect-editor

OBS の Browser Source で表示するテキスト演出用の URL を作成するエディタです。  
エディタ画面で見た目を調整し、生成された `mode=render` URL を OBS に設定して使用します。

## 主な機能

- テキスト内容、色、背景色、フォント、サイズ、太さ、文字間隔、縁取り、余白の調整
- シャドウの有効/無効と詳細パラメータ調整
- アニメーション（なし / フェード / パルス / スライド）
- スクロール（方向・速度・間隔）
- 点滅（周期・点灯率）
- ライブプレビュー（解像度・背景切替）
- 設定を埋め込んだレンダー URL 生成とコピー

## 動作モード

- エディタモード:
  - 通常アクセス（`/`）で表示
  - 設定 UI とライブプレビューを提供
- レンダーモード:
  - `?mode=render&cfg=...` で表示
  - OBS の Browser Source にはこの URL を設定

`cfg` には設定 JSON を Base64URL 形式でエンコードした値が入ります。

## セットアップ

前提:

- Node.js 20 以上推奨
- pnpm

```bash
pnpm install
pnpm dev
```

起動後、表示された URL（例: `http://localhost:5173`）を開いてエディタを使用します。

## OBS での使い方

1. エディタで見た目を調整する
2. 「レンダーURL」の値をコピーする
3. OBS で Browser Source を追加する
4. URL にコピーしたレンダー URL を設定する
5. 必要に応じて幅・高さを配信解像度に合わせる

## OBS カスタム CSS での上書き

OBS 側のカスタム CSS で CSS 変数を指定すると、URL の設定より優先して上書きできます。  
特に `--te-text` は運用時のテキスト差し替えに便利です。

例:

```css
:root {
  --te-text: "Override from OBS";
  --te-color: #ffcc00;
  --te-color-opacity: 1;
  --te-font-family: "'Yu Gothic', sans-serif";
  --te-font-size: 80;
  --te-shadow-enabled: true;
  --te-animation-preset: pulse;
  --te-scroll-enabled: true;
  --te-scroll-direction: left;
  --te-scroll-speed: 12;
  --te-blink-enabled: true;
}
```

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # TypeScript チェック + ビルド
pnpm preview  # ビルド結果のローカル確認
pnpm lint     # ESLint
```

## 注意事項

- Web フォントの配信は行っていません。表示可否は実行環境（OBS を動かしている OS）にインストールされたフォントへ依存します。
- フォント設定はエディタの候補リストから選択する前提です。未定義の値が渡された場合は既定値へフォールバックします。
- Browser Source のキャッシュ挙動により、変更反映に再読み込みが必要な場合があります。
