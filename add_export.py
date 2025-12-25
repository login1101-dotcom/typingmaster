import os

FILE_PATH = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone/results.html"

# HTML Snippet for Export/Import buttons
BUTTONS_HTML = """
            <div style="display:flex; gap:10px;">
                <button onclick="exportData()" class="action-btn" style="background:#e0f2fe; border:1px solid #7dd3fc; color:#0369a1;">データ保存(DL)</button>
                <button onclick="triggerImport()" class="action-btn" style="background:#f0fdf4; border:1px solid #86efac; color:#15803d;">データ復元</button>
                <input type="file" id="importFile" style="display:none;" accept=".json" onchange="importData(this)">
                <button onclick="clearData()" class="reset-btn">全データ初期化</button>
            </div>
"""

# JS Functions for Export/Import
JS_FUNCTIONS = """
    function exportData() {
        const data = {
            results: JSON.parse(localStorage.getItem('typingTestResults') || '[]'),
            titles: JSON.parse(localStorage.getItem('typingTitles') || '[]'),
            certs: JSON.parse(localStorage.getItem('typingCerts') || '{}'),
            streak: localStorage.getItem('typingStreak') || 0
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing_data_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function triggerImport() {
        document.getElementById('importFile').click();
    }

    function importData(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm("現在のデータを上書きして復元しますか？")) {
                    if(data.results) localStorage.setItem('typingTestResults', JSON.stringify(data.results));
                    if(data.titles) localStorage.setItem('typingTitles', JSON.stringify(data.titles));
                    if(data.certs) localStorage.setItem('typingCerts', JSON.stringify(data.certs));
                    if(data.streak) localStorage.setItem('typingStreak', data.streak);
                    alert("復元が完了しました。ページをリロードします。");
                    location.reload();
                }
            } catch (err) {
                alert("ファイルの読み込みに失敗しました。正しいデータファイルを選択してください。");
            }
        };
        reader.readAsText(file);
    }
"""

# CSS for action buttons
CSS_STYLE = """
    .action-btn {
      cursor: pointer;
      font-size: 14px;
      padding: 6px 16px;
      border-radius: 6px;
      transition: filter 0.2s;
    }
    .action-btn:hover {
      filter: brightness(0.95);
    }
"""

def add_export_import():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject CSS
    if ".reset-btn {" in content and ".action-btn" not in content:
        content = content.replace(".reset-btn {", CSS_STYLE + "\n    .reset-btn {")

    # 2. Inject Buttons (Replace the old clear button area)
    # Target: <button onclick="clearData()" class="reset-btn">全データ初期化</button>
    if '<button onclick="clearData()" class="reset-btn">全データ初期化</button>' in content:
        content = content.replace(
            '<button onclick="clearData()" class="reset-btn">全データ初期化</button>', 
            BUTTONS_HTML.strip()
        )

    # 3. Inject JS
    if "function clearData() {" in content and "function exportData() {" not in content:
        content = content.replace("function clearData() {", JS_FUNCTIONS + "\n\n        function clearData() {")

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added Export/Import features to results.html")

if __name__ == "__main__":
    add_export_import()
