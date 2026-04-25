"use client";

import React from "react";
import dynamic from "next/dynamic";

const BirdMap = dynamic(() => import("./BirdMap"), {
  ssr: false,
});

type BirdRecord = {
  id: number;
  japaneseName: string;
  family: string;
  photo: string;
  dateTaken: string;
  placeName: string;
  latitude: number;
  longitude: number;
  prefecture: string;
  country: string;
  individualType: string;
  memo: string;
  speciesGroupID: string;
};

type BirdGroup = {
  speciesGroupID: string;
  japaneseName: string;
  records: BirdRecord[];
  thumbnail: string;
  latestDate: string;
  places: string[];
};

type FormState = {
  japaneseName: string;
  family: string;
  photo: string;
  dateTaken: string;
  placeName: string;
  latitude: string;
  longitude: string;
  prefecture: string;
  country: string;
  individualType: string;
  memo: string;
  speciesGroupID: string;
};

    const individualTypeOptions = ["成鳥オス", "成鳥メス", "幼鳥オス", "幼鳥メス", "不明"];

    const csvTemplate = `id,japaneseName,family,photo,dateTaken,placeName,latitude,longitude,prefecture,country,individualType,memo,speciesGroupID
     1,ルリビタキ,ヒタキ科,/images/birds/ruribitaki-01.jpg,2026-01-12,京都御苑,35.0253,135.7621,京都府,日本,成鳥オス,朝の林縁で観察,ruribitaki
     2,ルリビタキ,ヒタキ科,/images/birds/ruribitaki-02.jpg,2026-01-15,比叡山,35.0704,135.8405,京都府,日本,成鳥メス,別地点で確認,ruribitaki
     3,カワセミ,カワセミ科,/images/birds/kawasemi-01.jpg,2025-11-03,鴨川,35.0116,135.7681,京都府,日本,不明,飛び込み確認,kawasemi`;
    const AUTO_CSV_PATH = "/data/birds_master.csv";

    const initialBirds: BirdRecord[] = [
    {
        id: 1,
        japaneseName: "ルリビタキ",
        family: "ヒタキ科",
        photo: "/images/birds/ruribitaki-01.jpg",
        dateTaken: "2026-01-12",
        placeName: "京都御苑",
        latitude: 35.0253,
        longitude: 135.7621,
        prefecture: "京都府",
        country: "日本",
        individualType: "成鳥オス",
        memo: "朝の林縁で観察。低い枝にしばらく止まっていた。",
        speciesGroupID: "ruribitaki",
    },
    {
        id: 2,
        japaneseName: "ルリビタキ",
        family: "ヒタキ科",
        photo: "/images/birds/ruribitaki-02.jpg",
        dateTaken: "2026-01-15",
        placeName: "比叡山",
        latitude: 35.0704,
        longitude: 135.8405,
        prefecture: "京都府",
        country: "日本",
        individualType: "成鳥メス",
        memo: "別地点で確認。尾を上下に振る動作が目立った。",
        speciesGroupID: "ruribitaki",
    },
    {
        id: 3,
        japaneseName: "カワセミ",
        family: "カワセミ科",
        photo: "/images/birds/kawasemi-01.jpg",
        dateTaken: "2025-11-03",
        placeName: "鴨川",
        latitude: 35.0116,
        longitude: 135.7681,
        prefecture: "京都府",
        country: "日本",
        individualType: "不明",
        memo: "川沿いの石の上から飛び込みを確認。",
        speciesGroupID: "kawasemi",
    },
    {
        id: 4,
        japaneseName: "シジュウカラ",
        family: "シジュウカラ科",
        photo: "/images/birds/shijukara-01.jpg",
        dateTaken: "2025-05-18",
        placeName: "京都府立植物園",
        latitude: 35.0567,
        longitude: 135.7612,
        prefecture: "京都府",
        country: "日本",
        individualType: "幼鳥オス",
        memo: "親鳥の後を追う行動が見られた。",
        speciesGroupID: "shijukara",
    },
    {
        id: 5,
        japaneseName: "ヤマガラ",
        family: "シジュウカラ科",
        photo: "/images/birds/yamagara-01.jpg",
        dateTaken: "2025-10-27",
        placeName: "比叡山",
        latitude: 35.0704,
        longitude: 135.8405,
        prefecture: "京都府",
        country: "日本",
        individualType: "成鳥メス",
        memo: "登山道脇で複数個体を確認。人への警戒が比較的弱かった。",
        speciesGroupID: "yamagara",
    },
    ];

    const emptyForm: FormState = {
    japaneseName: "",
    family: "",
    photo: "",
    dateTaken: "",
    placeName: "",
    latitude: "",
    longitude: "",
    prefecture: "",
    country: "日本",
    individualType: "不明",
    memo: "",
    speciesGroupID: "",
    };

    function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
        if (inQuotes && next === '"') {
            current += '"';
            i += 1;
        } else {
            inQuotes = !inQuotes;
        }
        } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
        } else {
        current += char;
        }
    }

    values.push(current.trim());
    return values;
    }

    function parseCsv(text: string): BirdRecord[] {
    const normalized = text.replace(/^\uFEFF/, "");
    const lines = normalized
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        throw new Error("CSVはヘッダー行とデータ行を含めてください。");
    }

    const headers = parseCsvLine(lines[0]);
    const requiredHeaders = [
        "id",
        "japaneseName",
        "family",
        "photo",
        "dateTaken",
        "placeName",
        "latitude",
        "longitude",
        "prefecture",
        "country",
        "individualType",
        "memo",
        "speciesGroupID",
    ];

    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length > 0) {
        throw new Error(`CSVの列が不足しています: ${missingHeaders.join(", ")}`);
    }

    return lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""]));

        return {
        id: Number(row.id) || Date.now() + index,
        japaneseName: row.japaneseName,
        family: row.family,
        photo: row.photo,
        dateTaken: row.dateTaken,
        placeName: row.placeName,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        prefecture: row.prefecture,
        country: row.country,
        individualType: individualTypeOptions.includes(row.individualType) ? row.individualType : "不明",
        memo: row.memo,
        speciesGroupID: row.speciesGroupID || row.japaneseName,
        };
    });
    }

    function groupBirds(records: BirdRecord[]): BirdGroup[] {
    const groups = new Map<string, BirdRecord[]>();

    for (const record of records) {
        const key = record.speciesGroupID || record.japaneseName;
        const existing = groups.get(key) ?? [];
        existing.push(record);
        groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([speciesGroupID, items]) => {
        const recordsSorted = [...items].sort((a, b) => b.dateTaken.localeCompare(a.dateTaken));
        return {
        speciesGroupID,
        japaneseName: recordsSorted[0].japaneseName,
        records: recordsSorted,
        thumbnail: recordsSorted[0].photo,
        latestDate: recordsSorted[0].dateTaken,
        places: Array.from(new Set(recordsSorted.map((item) => item.placeName))),
        };
    });
    }

    export default function BirdGalleryPage() {
    const [birds, setBirds] = React.useState<BirdRecord[]>(initialBirds);
    const [search, setSearch] = React.useState("");
    const [selectedType, setSelectedType] = React.useState("すべて");
    const [selectedPrefecture, setSelectedPrefecture] = React.useState("すべて");
    const [selectedFamily, setSelectedFamily] = React.useState("すべて");
    const [sortOrder, setSortOrder] = React.useState("name_asc");
    const [selectedGroupID, setSelectedGroupID] = React.useState("");
    const [selectedPhotoID, setSelectedPhotoID] = React.useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [isImageZoomOpen, setIsImageZoomOpen] = React.useState(false);
    const [csvText, setCsvText] = React.useState(csvTemplate);
    const [message, setMessage] = React.useState("");
    const [form, setForm] = React.useState<FormState>(emptyForm);
    const [autoLoaded, setAutoLoaded] = React.useState(false);

    const prefectures = [
        "すべて",
        ...new Set(birds.map((bird) => bird.prefecture).filter(Boolean)),
    ];

    const individualTypes = [
        "すべて",
        ...new Set(birds.map((bird) => bird.individualType)),
    ];
    const families = [
         "すべて",
        ...new Set(birds.map((bird) => bird.family).filter(Boolean)),
    ];

    const filteredGroups = React.useMemo(() => {
  const keyword = search.trim().toLowerCase();
  const grouped = groupBirds(birds);

  const result = grouped.filter((group) => {
    const recordsText = group.records
      .map((record) => [
        record.japaneseName,
        record.family,
        record.placeName,
        record.prefecture,
        record.country,
        record.individualType,
        record.memo,
        record.dateTaken,
        record.speciesGroupID,
      ].join(" "))
      .join(" ")
      .toLowerCase();

    const matchesSearch = keyword === "" || recordsText.includes(keyword);

    const matchesType =
      selectedType === "すべて" ||
      group.records.some((record) => record.individualType === selectedType);

    const matchesPrefecture =
      selectedPrefecture === "すべて" ||
      group.records.some((record) => record.prefecture === selectedPrefecture);

    const matchesFamily =
      selectedFamily === "すべて" ||
      group.records.some((record) => record.family === selectedFamily);

    return matchesSearch && matchesType && matchesPrefecture && matchesFamily;
  });

  // ← filter の外に出す（これが重要）
  result.sort((a, b) => {
    if (sortOrder === "name_asc") {
      return a.japaneseName.localeCompare(b.japaneseName, "ja");
    }
    if (sortOrder === "name_desc") {
      return b.japaneseName.localeCompare(a.japaneseName, "ja");
    }
    if (sortOrder === "date_asc") {
      return a.latestDate.localeCompare(b.latestDate);
    }
    return b.latestDate.localeCompare(a.latestDate);
  });

  return result;
}, [birds, search, selectedType, selectedPrefecture, selectedFamily, sortOrder]);
    const selectedGroup = React.useMemo(() => {
     return filteredGroups.find((group) => group.speciesGroupID === selectedGroupID) ?? null;
    }, [filteredGroups, selectedGroupID]);

    React.useEffect(() => {
        if (selectedGroup) {
        const hasSelectedPhoto = selectedGroup.records.some((record) => record.id === selectedPhotoID);
        if (!hasSelectedPhoto) {
            setSelectedPhotoID(selectedGroup.records[0]?.id ?? null);
        }
        }
    }, [selectedGroup, selectedPhotoID]);

    const selectedRecord = selectedGroup?.records.find((record) => record.id === selectedPhotoID) ?? selectedGroup?.records[0] ?? null;

    React.useEffect(() => {
        async function loadBirdsFromPublicCsv() {
        try {
            const response = await fetch(`${AUTO_CSV_PATH}?t=${Date.now()}`, {
            cache: "no-store",
            });
    
            if (!response.ok) {
            throw new Error("公開用CSVが見つかりませんでした。");
            }
    
            const text = await response.text();
            const imported = parseCsv(text);
            const grouped = groupBirds(imported).sort((a, b) =>
            a.japaneseName.localeCompare(b.japaneseName, "ja")
            );
    
            setCsvText(text);
            setBirds(imported);
            setSelectedGroupID(grouped[0]?.speciesGroupID ?? "");
            setSelectedPhotoID(grouped[0]?.records[0]?.id ?? null);
            setMessage(`公開用CSV ${AUTO_CSV_PATH} を自動読み込みしました。`);
            setAutoLoaded(true);
        } catch {
            setMessage("公開用CSVの自動読込に失敗しました。必要ならCSVを手動で読み込んでください。");
            setAutoLoaded(false);
        }
        }
    
        loadBirdsFromPublicCsv();
    }, []);

    function handleImportCsv() {
        try {
        const imported = parseCsv(csvText);
        setBirds(imported);
        const grouped = groupBirds(imported).sort((a, b) => a.japaneseName.localeCompare(b.japaneseName, "ja"));
        setSelectedGroupID(grouped[0]?.speciesGroupID ?? "");
        setSelectedPhotoID(grouped[0]?.records[0]?.id ?? null);
        setMessage(`${imported.length}件の記録を読み込みました。`);
        } catch (error) {
        setMessage(error instanceof Error ? error.message : "CSVの読み込みに失敗しました。");
        }
    }

    function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        setCsvText(text);
        setMessage(`${file.name} を読み込みました。内容を確認して「CSVを反映」を押してください。`);
        };
        reader.onerror = () => {
        setMessage("CSVファイルの読み込みに失敗しました。");
        };
        reader.readAsText(file, "utf-8");
    }

    function handleFormChange(key: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleAddBird() {
        if (!form.japaneseName || !form.photo || !form.dateTaken || !form.placeName) {
        setMessage("和名・写真URL・撮影日・撮影場所名は必須です。");
        return;
        }

        const speciesGroupID = form.speciesGroupID.trim() || form.japaneseName.trim().toLowerCase();

        const newBird: BirdRecord = {
        id: Date.now(),
        japaneseName: form.japaneseName,
        family: form.family,
        photo: form.photo,
        dateTaken: form.dateTaken,
        placeName: form.placeName,
        latitude: Number(form.latitude || 0),
        longitude: Number(form.longitude || 0),
        prefecture: form.prefecture,
        country: form.country,
        individualType: form.individualType,
        memo: form.memo,
        speciesGroupID,
        };

        setBirds((prev) => [newBird, ...prev]);
        setSelectedGroupID(speciesGroupID);
        setSelectedPhotoID(newBird.id);
        setForm(emptyForm);
        setMessage("新しい観察記録を追加しました。既存の speciesGroupID を使うと同じ種類に写真を追加できます。");
    }

    function downloadTemplate() {
        const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "birds_master_template.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    const mapRecords = selectedGroup?.records.filter(
        (record) => Number.isFinite(record.latitude) && Number.isFinite(record.longitude)
    ) ?? [];

    const mapCenter: [number, number] = selectedRecord && Number.isFinite(selectedRecord.latitude) && Number.isFinite(selectedRecord.longitude)
        ? [selectedRecord.latitude, selectedRecord.longitude]
        : mapRecords.length > 0
        ? [mapRecords[0].latitude, mapRecords[0].longitude]
        : [35.0116, 135.7681];

    const stats = {
        totalRecords: birds.length,
        totalSpecies: groupBirds(birds).length,
        prefectures: new Set(birds.map((bird) => bird.prefecture).filter(Boolean)).size,
        totalPhotosInSelectedGroup: selectedGroup?.records.length ?? 0,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-stone-100 text-slate-900">
        <header className="border-b border-white/60 bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-8">
            <p className="text-sm font-medium tracking-wide text-emerald-700">
              Wild Bird Photo Gallery</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              ロックセトリミメモリー（野鳥観察記録）</h1>
            <p className="mt-3 max-w-3xl text-base text-slate-600">
                観察した鳥の写真をアップロードするだけの自己満鳥見録用サイト
            </p>
            </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
            <section className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">総記録数</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalRecords}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">種類数</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalSpecies}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">都道府県数</p>
                <p className="mt-2 text-3xl font-bold">{stats.prefectures}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">選択種の写真数</p>
                <p className="mt-2 text-3xl font-bold">{stats.totalPhotosInSelectedGroup}</p>
            </div>
            </section>

            <section className="mb-8 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-5">
            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                キーワード検索
            </label>
            <input
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="和名・科・場所・メモなど"
             className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            />
           </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
             科
            </label>
            <select
             value={selectedFamily}
             onChange={(e) => setSelectedFamily(e.target.value)}
             className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
            >
             {families.map((family) => (
             <option key={family}>{family}</option>
            ))}
            </select>
            </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
            都道府県
            </label>
            <select
             value={selectedPrefecture}
             onChange={(e) => setSelectedPrefecture(e.target.value)}
             className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
            >
              {prefectures.map((prefecture) => (
              <option key={prefecture}>{prefecture}</option>
               ))}
            </select>
            </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
             個体区分
            </label>
            <select
             value={selectedType}
             onChange={(e) => setSelectedType(e.target.value)}
             className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
            >
             {individualTypes.map((type) => (
            <option key={type}>{type}</option>
            ))}
            </select>
            </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              撮影日
            </label>
            <select
             value={sortOrder}
             onChange={(e) => setSortOrder(e.target.value)}
             className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
            >
            <option value="name_asc">名前順（昇順）</option>
            <option value="name_desc">名前順（降順）</option>
            <option value="date_desc">最新撮影日が新しい順</option>
            <option value="date_asc">最新撮影日が古い順</option>
            </select>
            </div>
            </section>
            <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                <h2 className="text-2xl font-semibold">選択種の撮影地点マップ</h2>
                <p className="mt-1 text-sm text-slate-600">
                    同じ種類に紐づく複数写真の撮影地点を地図上に表示します。
                </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                表示中: {mapRecords.length} 地点
                </div>
            </div>
            <BirdMap
            mapCenter={mapCenter}
            mapRecords={mapRecords}
            onSelectPhoto={setSelectedPhotoID}
            />
            </section>

            <section className="grid gap-6">    
            <div>
                <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">種類一覧</h2>
                <p className="text-sm text-slate-500">{filteredGroups.length} 種類表示</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
                {filteredGroups.map((group) => (
                    <button
                    key={group.speciesGroupID}
                    onClick={() => {
                     setSelectedGroupID(group.speciesGroupID);
                     setSelectedPhotoID(group.records[0]?.id ?? null);
                     setIsPopupOpen(true);
                    }}
                    className={`overflow-hidden rounded-3xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                        selectedGroup?.speciesGroupID === group.speciesGroupID ? "ring-2 ring-slate-900" : ""
                    }`}
                    >
                    <img src={group.thumbnail} alt={group.japaneseName} className="h-40 w-full object-cover" />
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-slate-500">和名</p>
                            <h3 className="text-xl font-semibold">{group.japaneseName}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                            {group.records[0]?.family || "科 不明"}
                            </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {group.records.length}枚
                        </span>
                        </div>
                        <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                        <div className="flex justify-between gap-4">
                            <dt>最新撮影日</dt>
                            <dd className="font-medium text-slate-900">{group.latestDate}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt>撮影地数</dt>
                            <dd className="font-medium text-slate-900">{group.places.length}</dd>
                        </div>
                        <div>
                            <dt className="mb-1">主な撮影場所</dt>
                            <dd className="font-medium text-slate-900">{group.places.slice(0, 3).join(" / ")}</dd>
                        </div>
                        </dl>
                    </div>
                    </button>
                ))}
                </div>
            </div>

            </section>
        {isPopupOpen && selectedGroup && selectedRecord && (
    <div
         className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        onClick={() => setIsPopupOpen(false)}
    >
    <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
         setIsPopupOpen(false);
        }}
        className="absolute right-4 top-4 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
      >
        閉じる
      </button>

      <p className="text-sm font-medium tracking-wide text-slate-500">
        詳細表示
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {selectedGroup.japaneseName}
      </h2>

      <div className="mt-4 grid gap-3 grid-cols-4">
        {selectedGroup.records.map((record) => (
          <button
            key={record.id}
            onClick={() => setSelectedPhotoID(record.id)}
            className={`overflow-hidden rounded-2xl border ${
              selectedRecord.id === record.id
                ? "border-slate-900 ring-2 ring-slate-900"
                : "border-slate-200"
            }`}
          >
            <img
              src={record.photo || "/images/no-image.png"}
              alt={record.japaneseName}
              className="h-20 w-full object-cover"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsImageZoomOpen(true)}
        className="mt-4 block w-full overflow-hidden rounded-3xl"
      >
      <img
        src={selectedRecord.photo || "/images/no-image.png"}
        alt={selectedRecord.japaneseName}
        className="h-[420px] w-full object-cover transition hover:scale-[1.02]"
      />
      </button>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">科</dt>
          <dd className="mt-1 font-medium">{selectedRecord.family}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">撮影日</dt>
          <dd className="mt-1 font-medium">{selectedRecord.dateTaken}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">撮影場所名</dt>
          <dd className="mt-1 font-medium">{selectedRecord.placeName}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">都道府県</dt>
          <dd className="mt-1 font-medium">{selectedRecord.prefecture}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">個体区分</dt>
          <dd className="mt-1 font-medium">{selectedRecord.individualType}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <p className="text-sm text-slate-500">メモ</p>
        <p className="mt-2 leading-7 text-slate-700">
          {selectedRecord.memo || "メモなし"}
        </p>
      </div>
    </div>
  </div>
)}
{isImageZoomOpen && selectedRecord && (
  <div
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4"
    onClick={() => setIsImageZoomOpen(false)}
  >
    <img
      src={selectedRecord.photo || "/images/no-image.png"}
      alt={selectedRecord.japaneseName}
      className="max-h-[90vh] max-w-[95vw] rounded-3xl object-contain shadow-2xl"
    />
  </div>
)}
        </main>
        </div>
    );
    }
