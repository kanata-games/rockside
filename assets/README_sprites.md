# ドット絵スプライト（素材づくり担当）

全ファイル共通：透過PNG、横一列、右向き、アンチエイリアスなし（アルファは0か255のみ）。各フレームの下端が足元（地面）です。

| ファイル | 1フレーム | フレーム数 | フレーム順（0始まり） |
|---|---|---|---|
| kanon.png | 32×32 | 14 | 0-1 待機 / 2-5 走り / 6 ジャンプ / 7 落下 / 8 ショット / 9-12 走りながらショット / 13 被弾 |
| tobiume_dark.png | 48×48 | 8 | 0-1 待機 / 2-3 飛行 / 4-5 攻撃（5が発射の瞬間）/ 6 被弾 / 7 撃破 |
| neenia.png | 32×32 | 2 | 0 弓を構えて待機 / 1 矢を放つ（矢はゲーム側で発射） |
| seiten.png | 32×32 | 2 | 0-1 歌う |
| astarte.png | 32×32 | 2 | 0-1 鎌を持って立つ |
| lily.png | 32×32 | 2 | 0 マイクを持って待機 / 1 ウインク＋キラッ（待機ループ用） |

kanon.json と tobiume_dark.json に同じ内容を機械可読な形で入れてあります。
海音のショット系フレームには弾を描いていないので、弾はゲーム側で出してください（杖の先は枠の右端付近）。闇落ち飛梅の攻撃フレーム（4, 5）には手元の魔法の光だけ描き込んであります。飛ぶ弾はゲーム側で出してください。

## tobiume.png (通常の飛梅、闇落ち前) 32×32 × 15フレーム
- 0-1 待機 / 2-3 飛行 / 4-5 魔法（5が発射の瞬間、弾は描いていない）/ 6 被弾 / 7-10 通常攻撃のキック（7 構え、8 飛び上がり、9 前蹴り、10 ヒット）/ 11-14 必殺技スーパーウルトラ飛梅ちゃんキック（11 空中でため、12-13 斜め右下への急降下キック・ループ、14 着地の衝撃波）
- フレーム情報は tobiume.json

## ダーク版ボス（48×48 × 8フレーム、tobiume_dark.png と同じ形式）
- neenia_dark.png: 0-1 待機 / 2-3 歩き / 4-5 攻撃（4 弓を引く、5 放つ瞬間。矢はゲーム側）/ 6 被弾 / 7 撃破
- seiten_dark.png: 0-1 待機 / 2-3 跳びかかり（leap：2 空中で跳びかかる姿勢、3 しゃがみ＝踏み切りの溜めと着地の両方に使う）/ 4-5 攻撃（4 息を吸う、5 呪いの歌を放つ瞬間）/ 6 被弾 / 7 撃破
- astarte_dark.png: 0-1 待機 / 2-3 浮遊移動（glide）/ 4-5 攻撃（4 振りかぶり、5 斬撃の瞬間。斬撃の軌跡はスプライトに含む）/ 6 被弾 / 7 撃破
- lily_dark.png: 0-1 待機 / 2-3 くるりと回るダンスステップ（dance）/ 4-5 攻撃（4 マイクを口元に構えて息を吸う、5 歌声を放つ瞬間。赤い音波と小さな星はスプライトに含む）/ 6 被弾（待機を加工：のけぞり＋赤白フラッシュ＋目閉じ）/ 7 撃破（横たわる）
- フレーム情報は各 .json。体の中心 x（全フレーム共通、cxF 不要）: neenia_dark 20 / astarte_dark 22 / lily_dark 21（各 .json の "cx"）

## 顔アイコン（24×24、ステージセレクト用）
kanon_face.png, tobiume_face.png, tobiume_dark_face.png, neenia_face.png, neenia_dark_face.png, seiten_face.png, seiten_dark_face.png, astarte_face.png, astarte_dark_face.png, lily_face.png, lily_dark_face.png, disaster_dark_face.png, star_face.png（一覧: work/faces_preview.png）

## リリィ（lily）メモ
- lily.png の情報は allies.json の "lily"（idle: 0,1）。
- lily_dark.png の攻撃5は音波をマイクの右（x≈25-45, y≈10-17）に描き込み済み。（2026-10-03 作り直し）音波は x≈33-46, y≈11-18。飛ぶ弾を出すならマイク先端 ≈(30,15) から。フレーム5も体は他フレームと同じ位置（体の中心 x=21）。
- 生成: 画像生成の生素材 work/lily_raw.png / work/lily_dark_raw.png → pixel_sheet.py（通常版は work/lily_raw_med9.png＝メディアン9で前処理した生素材から）。被弾6は work/lily_dark_raw_composite.png で待機セルを加工して作成。顔は face_icon.py。

## ウミミ（umimi）サポート仲間 32×32 × 10フレーム
- ファイル: umimi.png（横一列・右向き・透過）、umimi.json（アニメ定義・fps/loop）、顔アイコン umimi_face.png（24×24）
- 用途: ロックマンのラッシュ的な呼び出し式サポート仲間。足場になる／回復する。
- フレーム順: 0-1 待機（浮遊、1は1px上がる）/ 2-3 泳ぎ移動（後ろに小さな泡）/ 4 登場（月光の淡い金色の縁取りとキラキラ）/ 5-6 足場（白い月の円盤に乗った姿。円盤が乗れる面：フレーム内 y=24 が上面、x=1〜31。6は踏まれた時用だが差はごく小さい）/ 7-8 回復（額の三日月が光り、キラキラ・月・ハートが昇る。8が一番明るい瞬間）/ 9 退場（小さく縮んで淡く消えていく）
- 生成: 画像生成の生素材 work/umimi_raw.png → work/umimi_prep.py（左右反転・緑の光輪除去）→ work/umimi_build.py（パレット固定の縮小 umimi_convert.py ＋エフェクト）、顔は work/umimi_face.py

## 魔王ディザスター（disaster_dark）ボス 48×48 × 14フレーム
- 魔王ディザスター＝スターの闇の姿。中性的な見た目だが少年（男の子）。
- disaster_dark.png: 0-1 待機 / 2-3 滑空（glide）/ 4 変形・溜め（どの武器攻撃の前にも挟める）/ 5 剣 / 6 槍 / 7 斧 / 8 大鎌 / 9 弓 / 10 鞭（連接剣）/ 11 砲槍 / 12 被弾 / 13 撃破
- 武器名→フレーム: sword 5, spear 6, axe 7, scythe 8, bow 9, whip 10, lance 11（json の "weapons"）。先端・発射点の座標は disaster_dark.json の各 note。
- 共通スケール 0.16（体の高さ約40px）、体の中心 x=23（cx 23、cxF 不要）、足元 y≈45（浮遊ボスなので下端から約2px上）。撃破13のみ下端に接地。32色。
- alchemic_weapons.png（32×32×6: sword, spear, axe, scythe, bow, whip。砲槍は除外）: 武器だけのアイコン。柄の位置 grip は alchemic_weapons.json。drawDisasterWeapon で使う場合は drawImage(img, -size*gripNorm[0], -size*gripNorm[1], size, size)、size は 32 か 64 推奨。
- transform_fx.png（24×24×4: 火花 / 稲妻の輪 / 閃光 / 消えていく火花）: 紫の変形エフェクト。
- disaster_bullets.png（24×24×6、右向き: sword_wave, spear_bolt, ground_burst, arrow, scythe_wave, orb）: 弾はセル中央が中心。scythe_wave は原画が逆向きだったので左右反転済み。当たり判定の目安は disaster_bullets.json。
- 顔: disaster_dark_face.png（赤い目が光る・角が見える）。プレビュー: work/disaster_preview.png、整列確認: work/alignment_check.png
- 生成: work/disaster_dark_raw.jpg + work/disaster_weapons_raw.jpg → work/body_sheet.py work/disaster_dark_spec.json。武器・エフェクト・弾は work/build_icons.py（weapons_spec.json / fx_spec.json / starw_spec.json / bullets_spec.json、弓の弦は post_bow.py）。顔は work/faces_new.py

## スター（star）32×32 × 7フレーム
- 魔王ディザスターの本来の姿。中性的な見た目だが少年（男の子）。青い髪・緑の目・白いマフラー・赤い上着。
- star.png: 0-1 待機 / 2 喜ぶ（ジャンプして拳を上げる。足は下端から約3px上）/ 3 うれしい（胸に手＋黄色いきらめき）/ 4 ありがとう（おじぎ）/ 5 手を振る / 6 剣を掲げる
- 体の中心 x=16、足元は下端（joy 以外）、頭頂〜足 約29px。情報は star.json と allies.json の "star"。
- star_weapon.png（32×32×2: シアンの剣 / シアンの斬撃の弧）。顔: star_face.png。プレビュー: work/star_preview.png
- 生成: work/star_raw.jpg → work/body_sheet.py work/star_spec.json → work/star_post.py（顔の赤い点を除去、きらめきを黄色に）

## 変更履歴（2026-10-03）
- astarte_dark.png: 生素材から作り直し。全フレームで体が x=22 に揃う（ゲーム側は cx 22、cxF 削除でOK）。
- neenia_dark.png: 作り直し。体の中心 x=20、矢の先端 ≈(45,22)（フレーム5）。ゲーム側の cx 21 / muzX 40 / muzY 24 は json の値に合わせて更新を。
- neenia_dark_face.png: 通常版と区別できるよう、灰紫の色調＋赤く光る目＋茨に作り直し。
- lily_dark.png: フレーム5だけ作り直し、体の位置を他フレームに合わせた。
- seiten_dark.json / この README: leap の説明を修正（2 空中、3 しゃがみ）。画像の並びはゲームのコード（poseF 0 = 空中、1 = しゃがみ）と合っているので入れ替えていない。
- 追加: disaster_dark / alchemic_weapons / transform_fx / disaster_bullets / star / star_weapon と各顔アイコン、プレビュー（work/fixes_preview.png ほか）。

## リポジトリ（kanata-games/rockside）での注意 – 2026-10-03
- **lily_dark.png はリポジトリ版（ChatGPT が作り直したシート）を使い続けています。** 上の lily_dark の説明（フレーム5に音波を描き込み・cx=21）はローカル旧シートの修正版のもので、本番では採用していません。
  本番のシートはフレーム5に音波を含まず、音波は `lilySongWave`（02b_chars.js）として別レイヤーで歌攻撃のときだけ重ねます。体の中心 cx=24。
- Disaster / Star の素材（disaster_dark, star, alchemic_weapons, transform_fx, star_weapon, disaster_bullets, 顔）は本番に統合済み（src/04b_disaster.js）。
- astarte_dark（cx=22, cxF 廃止）、neenia_dark（cx=20, 矢先 45,22）、neenia_dark_face は本番に反映済み。
