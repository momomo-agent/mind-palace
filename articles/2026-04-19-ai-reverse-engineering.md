# 從逆向工程重新認識 AI 的強大 — Huli 實戰解讀

🔓 一個自稱「不太會逆向」的安全研究者，用 AI agent 全自動逆向了 7 個應用。不是 AI 輔助，是全 AI 逆向——人只在旁邊說「再試試」。

## 核心發現

AI 逆向工程已經不是「輔助人類做分析」，而是「自主完成從脫殼到解密的完整流程」。Huli 的角色退化到只剩兩件事：幫忙裝 Ghidra、在 AI 卡住時說「你換個方法試試」。

## 7 個案例的技術深度

### Cocos2d 遊戲（靜態分析）
AI 拆 APK → 發現遊戲邏輯在加密的 JS 裡 → 逆向 libcocos2djs.so → 識別 Blowfish 加密 → 追蹤 key 設置函數 → 發現 key 是逐字元 push_back 拼接的（所以掃不到連續字串）→ 反編譯還原 32 字元 key → 寫 Python 腳本解密所有資源。

關鍵：AI 先嘗試掃字串找 key，失敗後自動切換策略追蹤函數調用鏈。

### Cocos2d 遊戲（動態分析）
靜態分析找到的 key 解不開 → AI 自動切換到動態分析 → 裝 Android 模擬器 + Frida → hook xxtea_decrypt → 拿到正確 key → 順便用 frida-dexdump 脫殼。

關鍵：靜態走不通自動切動態，不需要人指導。

### Unity 遊戲（多策略組合）
IL2CPP + Lua 熱更新 + XOR 加密。AI 嘗試了：Il2CppDumper → ILSpy → jadx → UnityPy → 下載熱更新（404）→ 重新掃 asset bundle → 找到 3000 個加密 Lua → 觀察前 6 byte 模式 → 嘗試 XOR/AES 都失敗 → 反編譯 libil2cpp 確認是 6 byte XOR → 靜態找不到 key → 最後觀察到大量文件前 54 byte 相同 → 推理出 Lua 5.3 header 是已知明文 → 用已知明文攻擊還原 key。

關鍵：AI 的「神來一筆」——觀察到密文重複模式，推理出明文是 Lua header，用 known-plaintext attack 破解。這是真正的推理能力。

### Flutter + WASM
Dart 編譯成 WASM → AI 用 wasm-decompile 反編譯 → 識別出 Dart 的 string pool → 還原出 API endpoint 和加密 key。

### Electron 應用
ASAR 解包 → 發現 JS 被 V8 snapshot 保護 → 用 electron-snapshot-decompiler 還原 → 拿到完整源碼。

## 攻防平衡的顛覆

Huli 提出了一個深刻的問題：

> 守方花幾個月做的保護（混淆、加殼、anti-debug），AI 一兩小時就解開了。攻防平衡是否正在被打破？

傳統攻防的假設是「增加時間成本」——混淆讓人多花幾天，加殼讓人多花幾週。但 AI 不受時間成本約束，它可以無限嘗試不同策略，而且每次嘗試的邊際成本接近零。

Huli 的推測：守方可能需要「用 AI 加殼」——每次生成全新的保護模式，讓攻方無法復用經驗。但即便如此，AI 攻方可能一兩小時就又解開了。

## 對 AI 能力的重新認識

Huli 最後的結論：

> 如果 AI 可以自己規劃、寫程式、測試並驗證結果，那是不是讓他一直跑，可以做出一個完整的應用程式，而且品質還很好？

這跟 Steinberger 同時跑 4-10 個 coding agent 的實踐是同一個方向——AI 的能力邊界不在單次推理，而在持續迭代和策略切換的能力。

## 技術棧

- Ghidra + MCP server（靜態分析）
- Frida（動態 hook）
- Unicorn Engine（模擬執行）
- jadx / ILSpy / Il2CppDumper / UnityPy（各平台反編譯）
- Claude Code 作為 agent 驅動層
