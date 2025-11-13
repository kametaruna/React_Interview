import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import questions from "./questions";

function App() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [locked, setLocked] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  const captureRef = useRef(null);
  const curatedQuestions = questions.slice(0, 50);

  const getRandomQuestions = (source = questions) => {
    const current = [...selectedQuestions];
    const unlockedIndices = current
      .map((q, i) => (locked[q] ? null : i))
      .filter((i) => i !== null);

    const available = source.filter((q) => !current.includes(q));
    const shuffled = [...available].sort(() => 0.5 - Math.random());

    unlockedIndices.forEach((i, idx) => {
      if (shuffled[idx]) current[i] = shuffled[idx];
    });

    if (current.length === 0) {
      current.push(...shuffled.slice(0, 6));
    }

    setSelectedQuestions(current.slice(0, 6));
  };

  const getRandomCuratedQuestions = () => {
    getRandomQuestions(curatedQuestions);
  };

  const handleLockToggle = (q) => {
    setLocked((prev) => ({ ...prev, [q]: !prev[q] }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { scale: 2 });
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${name || "interview"}.png`;
    link.click();
  };

  const leftQuestions = selectedQuestions.slice(0, 2);
  const rightQuestions = selectedQuestions.slice(2);

  const renderQuestion = (q) => (
    <div
      key={q}
      className="bg-gray-50 p-3 rounded-lg border border-gray-200 w-full relative"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-gray-800 pr-6">{q}</p>
        <button
          onClick={() => handleLockToggle(q)}
          className={`absolute top-2 right-2 text-sm px-2 py-1 rounded ${
            locked[q]
              ? "bg-yellow-400 text-white hover:bg-yellow-500"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {locked[q] ? "🔒" : "🔓"}
        </button>
      </div>
      <textarea
        value={answers[q] || ""}
        onChange={(e) =>
          setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
        }
        placeholder="ここに回答を入力"
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows="2"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-600">
            キャラインタビュー
          </h1>
          <button
            onClick={() => setShowHelp(true)}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow"
          >
            ℹ️ 使い方
          </button>
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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => getRandomQuestions(questions)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow"
          >
            ランダム(候補300問)
          </button>
          <button
            onClick={getRandomCuratedQuestions}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg shadow"
          >
            厳選(候補50問)
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
                <p className="text-2xl font-bold text-blue-600 text-center">
                  {name}
                </p>
              )}
              {leftQuestions.map(renderQuestion)}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {rightQuestions.map(renderQuestion)}
            </div>
          </div>
        )}

        {/* モーダル（使い方説明） */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold mb-3 text-blue-600">
                使い方と注意点
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li>画像をアップロードしてキャラ名を入力します。</li>
                <li>画像は正方形に近いものを推奨します。縦長/横長画像はpng出力の際に歪みます。適宜スクリーンショットなどで対応してください。</li>
                <li>「ランダム」または「厳選」ボタンで質問を表示します。質問が微妙だなと思ったらボタンを押すと再抽選できます。「厳選」の方が答えやすい/広げやすいとは思います。</li>
                <li>質問横の🔒ボタンを押すとその質問がロックされます。ロックされていない質問だけが再抽選で入れ替わります。</li>
                <li>回答欄には自由に記入できます。</li>
                <li>「PNG出力」ボタンで現在の画面を画像として保存できます。</li>
                <li>外部画像を使用する場合は権利にご注意ください。</li>
                <li>スマホでは縦スクロールが必要になる場合があります。</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
