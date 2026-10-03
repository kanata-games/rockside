# ROCKSIDE – 海音の冒険

海音（うみね / UMINE）が杖の水ショットで進む、ドット絵の横スクロールアクションゲーム（ロックマン風）。ブラウザだけで遊べます（スマホ対応）。

**プレイ:** https://kanata-games.github.io/rockside/

---

## 遊び方（概要）

タイトル → **ステージセレクト**（3×3）。友だちが「DARK」ボスとして待っています。倒すと元に戻って仲間になります。
外側8エリアをすべてクリアすると中央の最終エリアが開きます。進み具合はブラウザに保存されます（タイトル右上「ERASE DATA」2回で消去）。

### ステージセレクトのマス（slot）

| | 左 | 中 | 右 |
|---|---|---|---|
| 上 | 0 夕焼けの丘 SUNSET HILLS / DARK 飛梅 | 1 災厄の紅月城 DISASTER CASTLE / 魔王ディザスター | 2 月影の森 MOON WOODS / DARK ネーニア |
| 中 | 3 月光の歌劇城 MOONLIGHT PALACE / DARK リリィ | 4 **最終エリア**（8つクリアで解放・準備中） | 5 狐火の社 FOXFIRE SHRINE / DARK シラヌイ |
| 下 | 6 夜曲の街 NIGHT CITY / DARK 青天 | 7 friend8（準備中） | 8 星導の聖堂 STAR SHRINE / DARK アスターテ |

### 仲間サポート / 魔法
- **SUP**（セレクト画面左上 / キー V）: 救出した仲間を1人セット。ステージ中 **HELP** ボタン（キー B）で1回だけ呼べます。
  飛梅 KICK / ネーニア RAIN / 青天 SONG（回復）/ アスターテ SLASH / リリィ LIVE / スターさん MORPH（錬金剣が剣→槍に変形する2段斬り）/ シラヌイ FOX（追尾する狐火4発）。
- リリィをセットすると、ほかのステージの開始地点でリリィが **ウミミ**（HP6）を預けてくれます。ウミミは弾を防いでくれますが、HPが0になると LIVE は使えません（DOWN）。
- **ORB**（キー C）: MPを6使って一時的な水の足場を出します。
- **HARD**（タイトル左上 / キー H）: 海音のHP半分・ボスは常に怒り状態。

### 操作
| 操作 | タッチ | キーボード |
|---|---|---|
| 移動 | 左下ボタン | ← → / A D |
| ジャンプ | JUMP | Z / Space / K |
| ショット | SHOT | X / J |
| 水の足場 | ORB | C |
| 仲間サポート | HELP | B |
| サポート切替（セレクト） | SUP 枠をタップ | V |
| 決定 / スタート | タップ | Enter |
| セレクト → タイトル | TITLE | Esc |
| 音 | SOUND | M |

---

## 名前の表記（正式）

| キャラ | ゲーム内表示（日本語） | ローマ字表記（HUD・英語テキスト） | 内部 id（変更しない） |
|---|---|---|---|
| 主人公 | 海音 | UMINE | `kanon`（スプライト名） |
| 飛梅 | 飛梅 | TOBIUME | `tobiume` |
| ネーニア | ネーニア | **NENIA** | `neenia` |
| 青天 | 青天 | SEITEN | `seiten` |
| アスターテ | アスターテ | **ASTARTHE** | `astarte` |
| リリィ | リリィ | LILY | `lily` |
| ウミミ | ウミミ | UMIMI | `umimi` |
| スターさん（男の子・he/him） | スターさん | STAR | `star`（救出 id）/ エリア・ボス id `disaster` |
| 魔王ディザスター（闇落ちしたスターさん） | 魔王ディザスター | DEMON LORD DISASTER（HUD: DISASTER） | `disaster` |
| シラヌイ（狐の花魁風の女性・「〜のじゃ」口調） | シラヌイ | SHIRANUI | `shiranui`（エリア・ボス・救出 id 共通）/ ステージ内の仲間マーク `K` |

内部 id（エリア id・ファイル名・セーブデータ）は**変えません**。セーブの互換性が壊れるためです。表示名だけを変えてください。

---

## リポジトリ構成

```
index.html        ← ビルド結果（GitHub Pages が配信）。直接編集しない！
src/              ← ★ソースはここ。index.html はこれを連結して作られる
  01_head.html      HTML/CSS + CONFIG（調整値）+ ステージマップ + AREAS（セレクトのマス）
  02_setup.js       定数・フォント・描画ヘルパー
  02b_chars.js      キャラ/ボスのスプライト定義（SHEET_DEFS）とローダー
  03_world.js       背景・タイル・入力・レイアウト
  04_game.js        ゲームロジック（プレイヤー・敵・ボスAI・サポート・セーブ）
  04b_disaster.js   エリア5 魔王ディザスター（錬金剣の変形ボス）とスターさんのサポート技
  04c_shiranui.js   エリア7 DARK シラヌイ（狐火のボス）とシラヌイのサポート技
  05_render.js      描画・UI・ステージセレクト・window.ROCKSIDE（テスト用フック）
assets/           ← スプライトシート PNG + フレーム定義 JSON（Pages ではここから読み込み）
tools/
  build.py          src/ → index.html
  test.js           ヘッドレス総合テスト（Playwright）
  balance.js        ボス難易度ボット（ゴッドモードなしで N 回戦う）
  bossbot.js        テスト/バランス用ボット
  serve.js          ローカル http サーバ（file:// ではなく http で動かす）
preview/          ← 試作ページ（本番とは別のセーブデータ）。本番に入れたら削除してよい
```

## ビルド・テスト

```sh
# 初回のみ
cd tools && npm install && npx playwright install chromium && cd ..

python3 tools/build.py            # src/ → index.html（スプライトは assets/ から読み込む）
node tools/test.js                # 全テスト（約7分）。AREAS=lily で特定エリアのボス戦だけに絞れる
node tools/balance.js 6 3         # エリア6のボスを3回（ゴッドモードなし）
node tools/serve.js               # http://127.0.0.1:8000/ でローカル確認
python3 tools/build.py --embed --out /tmp/rockside.html   # 旧来の1ファイル版（主要スプライト埋め込み）
```

`index.html` は `assets/` が隣にある前提です（GitHub Pages ではそのまま動きます）。ローカルでは `file://` ではなく `node tools/serve.js` で開いてください。

デバッグ用 URL パラメータ: `?area=N`（エリア番号 no で直接開始）, `&boss=1`（ボス部屋前から）, `&god=1`, `&hitbox=1`, `&hard=1`, `?unlockall=1`, `?sprites=0`（手描き無し）, `?supporttest=1&supportfriend=lily`。

---

## 共同作業ルール（人間・Claude・ChatGPT 共通）

1. **編集するのは `src/`・`assets/`・`tools/` だけ。** `index.html` を直接編集しない（次のビルドで消えます）。
2. 作業の流れは毎回 **pull → 編集 → build → test → commit（index.html も一緒に）→ push**。
   ```sh
   git pull --ff-only
   # src/ を編集
   python3 tools/build.py && node tools/test.js
   git add -A && git commit -m "…" && git push
   ```
   テストを実行できない環境（例: ブラウザ版 ChatGPT）の場合は、ビルドだけ行い、コミットメッセージに「untested」と書いてください。次に作業する人がテストします。
3. **名前・id・パターン名を変えたら、同じコミットで `tools/test.js` も直す。** 表示名の変更では内部 id は変えない（上の表）。
4. 新しいエリア/ボスを足したら test.js の `V4` 配列に1行追加（no / id / slot / hud / パターン名）。
5. セーブデータは `localStorage['rockside_progress_v1']` = `{ cleared, rescued, support }`。キー名・既存フィールドの意味を変えない（追加は可）。
6. 試作は `preview/` に別ファイルで（別の PROGRESS_KEY を使う）か、ブランチで。本番に入れたら試作は消す。
7. リリースごとに `src/01_head.html` の `GAME_VERSION` を上げる（タイトルと画面下に表示）。
8. 小さいコミット・わかりやすいメッセージ。大きな変更の前に `git pull`。

---

## 魔王ディザスター戦（エリア5）

闇落ちしたスターさん（男の子）。錬金剣が毎回形を変えます。どの攻撃も **紫の変形フラッシュ＋頭上に次の武器アイコン** → 武器ごとの予告 → 攻撃 → すき、の順。
剣（低い三日月波、怒り時は高い波も）/ 槍（照準線→固定→投げ槍）/ 斧（飛び上がり→床マーク→叩きつけ＋衝撃波）/ 鎌（低い三日月がブーメランのように戻ってくる）/ 弓（後退→2方向は真ん中が安全、怒り時3方向）/ 鞭剣（床に届く範囲の点線→低い連節の刃）/ 砲槍（銃口にチャージ光＋短い照準線→光弾。床に当たると左右に小さな衝撃波、怒り時3発）。
HP 40。HPが半分以下（またはHARD）で変形が速くなり、2つの武器を連続で使うことがあります。

絵素材（`assets/`、詳しくは `assets/README_sprites.md`）:
- `disaster_dark.png/.json` 48x48×14（体の中心 x=23）。武器ごとに体のフレームがあり、武器は絵に描き込み済み。フレーム4が変形ポーズ。銃口などの位置は `src/04b_disaster.js` の `DISASTER_WEAPONS[k].muz`。
- `alchemic_weapons.png/.json`（変形中に頭上に出す武器アイコン。持ち手位置 gripNorm で描画）、`transform_fx.png`（変形の紫フラッシュ）、`disaster_bullets.png/.json`（弾）。
- `star.png/.json` 32x32×7（救出ポーズとサポート技）、`star_weapon.png`（シアンの剣と斬撃）、顔アイコン `disaster_dark_face.png` / `star_face.png`。
- 砲槍（lance）の武器アイコンは alchemic_weapons.png のセル6（2026-10-03 追加）。

## DARK シラヌイ戦（エリア7・狐火の社）

赤い鳥居と紅提灯の夜の社。闇に飲まれたシラヌイ（花魁風の狐の女性、「わらわ」「〜のじゃ」口調）。HP 38。どの攻撃も **扇子を振りかぶるポーズ＋頭上の光（攻撃ごとに色が違う）** が予告です。
狐火の連射（少し追尾、怒り時5発）/ 鬼火（紫の鬼火が周りを回ってから1つずつ漂ってくる）/ 炎の三日月（床を走る、ジャンプ。怒り時2発）/ 扇子ブーメラン（行きは低い→ジャンプ、帰りは頭上。怒り時は帰りも低い）/ 火柱（床に火の粉の印→噴き上がる。怒り時3本）/ 幻影（消えて分身2体と点滅しながら再登場。分身は撃つと消える。残った全員が狐火を投げる）。
救出後: おじぎ→笑顔→扇子を振るポーズ。サポート技 **FOX**（狐火4発が敵やボスを追尾。ボスには計4ダメージ）。
ステージ内の仲間 `K`（救出後）: 夜曲の街・星導の聖堂・災厄の紅月城に出てきて、近くの敵に追尾する狐火を撃ってくれます（自分のステージには出ません）。
セリフは `src/04_game.js` の `BOSS_TYPES.shiranui.line` と `ALLY_LINES.K`、サポートの表示は `src/05_render.js`（「シラヌイ・狐火の舞じゃ！」）。

## キャラクターについて

登場キャラクター（海音、飛梅、ネーニア、青天、アスターテ、リリィ、ウミミ、スターさん、シラヌイ ほか）は作者の友人たちのキャラクターです。キャラクターの権利はそれぞれの持ち主に帰属します。無断での転載・二次利用はご遠慮ください。
