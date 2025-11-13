import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import questions from "./questions";

function App() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showForDownload, setShowForDownload] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // 👈 折りたたみ制御

  const captureRef = useRef(null);

  // ランダム6問（全体）
  const getRandomQuestions = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    setSelectedQuestions(selected);
    setAnswers({});
  };

  // 厳選6問（上位50）
  const getSelectedFromTop50 = () => {
    const top50 = questions.slice(0, 50);
    const shuffled = [...top50].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    setSelectedQuestions(selected);
    setAnswers({});
  };

  // 画像アップロード
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // PNG保存（改行保持）
  const handleDownload = async () => {
    if (!captureRef.current) return;

    setShowForDownload(true);
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(captureRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${name || "interview"}.png`;
    link.click();

    setShowForDownload(false);
  };

  const leftQuestions = selectedQuestions.slice(0, 2);
  const rightQuestions = selectedQuestions.slice(2);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-6 space-y-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          キャラインタビュー
        </h1>

        {/* 折りたたみ式 使い方と注意点 */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-6 border border-gray-200">
          <button
            onClick={() => setShowGuide((prev) => !prev)}
            className="w-full flex justify-between items-center text-left text-blue-600 font-semibold text-lg focus:outline-none"
          >
            <span>📘 使い方と注意点</span>
            <span>{showGuide ? "▲" : "▼"}</span>
          </button>

          {showGuide && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li>画像をアップロードしてキャラ名を入力します。</li>
                <li>「ランダム6問」または「厳選6問」ボタンで質問を表示します。</li>
                <li>質問横の🔒ボタンを押すとその質問が固定されます。</li>
                <li>ロックされていない質問だけが再抽選で入れ替わります。</li>
                <li>回答欄に自由に記入できます。</li>
                <li>「PNG出力」ボタンで現在の画面を画像として保存できます。</li>
                <li>外部画像を使用する場合は権利にご注意ください。</li>
                <li>スマホでは縦スクロールが必要になる場合があります。</li>
              </ul>
            </div>
          )}
        </div>

        {/* 操作パネル */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="キャラ名を入力"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* ボタン行 */}
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <button
            onClick={getRandomQuestions}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow"
          >
            ランダム6問（全体）
          </button>
          <button
            onClick={getSelectedFromTop50}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg shadow"
          >
            厳選6問（上位50）
          </button>
          {selectedQuestions.length > 0 && (
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow"
            >
              PNG出力
            </button>
          )}
        </div>

        {/* 横長カード */}
        {selectedQuestions.length > 0 && (
          <div
            ref={captureRef}
            className="bg-white rounded-3xl shadow-2xl p-6 flex flex-row gap-6"
          >
            {/* 左カラム */}
            <div className="flex-1 flex flex-col gap-4 items-center">
              {image ? (
                <img
                  src={image}
                  alt="キャラ画像"
                  className="w-48 h-48 rounded-xl shadow-md object-contain bg-gray-100"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {name && (
                <p className="text-2xl font-bold text-blue-600 text-center">{name}</p>
              )}

              {leftQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 w-full"
                >
                  <p className="font-semibold text-gray-800 mb-2">{q}</p>
                  {!showForDownload ? (
                    <textarea
                      value={answers[q] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                      }
                      placeholder="ここに回答を入力"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows="2"
                    />
                  ) : (
                    <div className="w-full p-2 border border-gray-300 rounded-lg whitespace-pre-wrap break-words">
                      {answers[q] || ""}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 右カラム */}
            <div className="flex-1 flex flex-col gap-4">
              {rightQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold text-gray-800 mb-2">{q}</p>
                  {!showForDownload ? (
                    <textarea
                      value={answers[q] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                      }
                      placeholder="ここに回答を入力"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows="2"
                    />
                  ) : (
                    <div className="w-full p-2 border border-gray-300 rounded-lg whitespace-pre-wrap break-words">
                      {answers[q] || ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
