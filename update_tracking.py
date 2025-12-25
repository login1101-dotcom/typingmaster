import os

FILE_PATH = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone/mainframe.js"

def improve_tracking_logic():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add totalKeyStrokes variable init
    if "let totalKeyStrokes = 0;" not in content:
        content = content.replace("let attemptedCount = 0;", "let attemptedCount = 0;\nlet totalKeyStrokes = 0;")
        
    # 2. Reset variable in startTest
    if "totalKeyStrokes = 0;" not in content:
        content = content.replace("attemptedCount = 0;", "attemptedCount = 0;\n  totalKeyStrokes = 0;")
        
    # 3. Increment logic in keydown
    # We want to increment on every valid-ish keydown.
    # Insert it right after checks.
    # existing: const key = e.key.toLowerCase();
    # existing: if (!currentRoma) return;
    
    # We will insert `totalKeyStrokes++;` before logic checks.
    # But only if it's a letter? simplified: all keys that pass isGameStarted
    if "totalKeyStrokes++;" not in content:
        # Looking for a good injection point
        injection_point = "if (!currentRoma) return;"
        content = content.replace(injection_point, injection_point + "\n\n  // 総打鍵数をカウント\n  totalKeyStrokes++;")

    # 4. Fix Accuracy Calculation in renderTopBar
    # old: const accuracy = attemptedCount ? Math.floor((correctCount / attemptedCount) * 100) : 0;
    # attemptedCount was actually detecting "problems started".
    # We should use totalKeyStrokes for accuracy.
    # Wait, correctCount counts *characters* typed correctly?
    # Yes: if (key === currentRoma[0]) ... correctCount++;
    
    # So Accuracy = (correctCount / totalKeyStrokes) * 100
    if "const accuracy = attemptedCount" in content:
        content = content.replace(
            "const accuracy = attemptedCount", 
            "const accuracy = totalKeyStrokes"
        ).replace(
            "correctCount / attemptedCount", 
            "correctCount / totalKeyStrokes"
        )

    # 5. Save totalKeyStrokes in saveResult
    if "timeLimit: timeLimit" in content:
        if "totalKeyStrokes: totalKeyStrokes" not in content:
            content = content.replace(
                "timeLimit: timeLimit", 
                "timeLimit: timeLimit,\n    totalKeyStrokes: totalKeyStrokes"
            )

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated mainframe.js tracking logic.")

if __name__ == "__main__":
    improve_tracking_logic()
