# CLAUDE.md

## 溝通語言
所有溝通請使用**繁體中文**。

## 專案簡介
這是一個**碳水循環飲食計算機**網頁專案。

- 主要檔案：`index.html`（單一檔案包含 HTML、CSS、JavaScript）
- 功能：根據使用者體重與訓練等級計算高碳日／低碳日的碳水、蛋白質、脂肪攝取量，並提供飲食日記、飲食模板、食物庫管理等功能
- 後端：Firebase（Authentication + Firestore）

## Git 工作流程
每次修改完成後，請自動執行以下步驟：

```bash
git add index.html
git commit -m "<commit message>"
git push origin master
```

- commit message 請使用繁體中文描述本次修改內容
- 遠端分支為 `master`
