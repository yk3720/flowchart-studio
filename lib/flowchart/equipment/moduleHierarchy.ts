export type FlowModule = {
  /** modules.id (uuid) — flow_documents FK */
  id: string;
  label: string;
  /** 設計メモ（1/動作 · v1.1） */
  memo?: string;
  /** DB modules.legacy_key — 旧 localStorage / offline キー解決用 */
  legacyKey?: string;
  /** サーバーで算出したフロー中身リセット可否（クライアント表示用） */
  canReset?: boolean;
  /** サーバーで算出した削除可否（クライアント表示用） */
  canDelete?: boolean;
};

export type FlowUnit = {
  id: string;
  label: string;
  /** 設計メモ（1/ユニット · v1.1） */
  memo?: string;
  modules: FlowModule[];
  /** import 時の登録者（units.created_by）— サーバー内部のみ。クライアントには渡さない */
  createdBy?: string;
  /** サーバーで算出した削除可否（クライアント表示用） */
  canDelete?: boolean;
};

export type Device = {
  id: string;
  /** devices.internal_code — 社内番号（1 装置 = 1 コード · 012 で equipment_codes 統合） */
  internalCode?: string;
  name: string;
  /** 設計メモ（1/装置 · v1.1） */
  memo?: string;
  units: FlowUnit[];
  /** import 時の登録者（devices.created_by） */
  createdBy?: string;
  /** サーバーで算出した装置削除可否（クライアント表示用） */
  canDelete?: boolean;
};

/** 永続化キー（localStorage · クラウド · IndexedDB 共通）— modules.id uuid */
export function moduleStorageKey(moduleUuid: string): string {
  return moduleUuid;
}

/** @deprecated DB-2 以前 — moduleStorageKey(moduleUuid) を使用 */
export function moduleDraftKey(_deviceId: string, moduleId: string): string {
  return moduleId;
}

/** Phase 3 デモ — プレス機 A（004 seed と同一 uuid） */
export const DEMO_DEVICE_PRESS_A: Device = {
  id: "a0000001-0001-4001-8001-000000000001",
  internalCode: "DEMO-001",
  name: "プレス機 A",
  units: [
    {
      id: "b0000001-0001-4001-8001-000000000101",
      label: "供給ユニット",
      modules: [
        {
          id: "c0000001-0001-4001-8001-000000001001",
          label: "供給動作",
          legacyKey: "DEMO-001:supply-feed",
        },
        {
          id: "c0000001-0001-4001-8001-000000001002",
          label: "検知動作",
          legacyKey: "DEMO-001:supply-detect",
        },
      ],
    },
    {
      id: "b0000001-0001-4001-8001-000000000102",
      label: "プレスユニット",
      modules: [
        {
          id: "c0000001-0001-4001-8001-000000001003",
          label: "プレス動作",
          legacyKey: "DEMO-001:press-cycle",
        },
        {
          id: "c0000001-0001-4001-8001-000000001004",
          label: "離脱動作",
          legacyKey: "DEMO-001:press-release",
        },
      ],
    },
    {
      id: "b0000001-0001-4001-8001-000000000103",
      label: "収納ユニット",
      modules: [
        {
          id: "c0000001-0001-4001-8001-000000001005",
          label: "排出動作",
          legacyKey: "DEMO-001:storage-eject",
        },
      ],
    },
  ],
};

/** Phase 3 デモ — プレス機 B（004 seed と同一 uuid） */
export const DEMO_DEVICE_PRESS_B: Device = {
  id: "a0000001-0001-4001-8001-000000000002",
  internalCode: "DEMO-002",
  name: "プレス機 B",
  units: [
    {
      id: "b0000002-0001-4001-8001-000000000201",
      label: "供給ユニット",
      modules: [
        {
          id: "c0000002-0001-4001-8001-000000002001",
          label: "供給動作",
          legacyKey: "DEMO-002:b-supply-feed",
        },
        {
          id: "c0000002-0001-4001-8001-000000002002",
          label: "検知動作",
          legacyKey: "DEMO-002:b-supply-detect",
        },
      ],
    },
    {
      id: "b0000002-0001-4001-8001-000000000202",
      label: "プレスユニット",
      modules: [
        {
          id: "c0000002-0001-4001-8001-000000002003",
          label: "プレス動作",
          legacyKey: "DEMO-002:b-press-cycle",
        },
        {
          id: "c0000002-0001-4001-8001-000000002004",
          label: "離脱動作",
          legacyKey: "DEMO-002:b-press-release",
        },
      ],
    },
    {
      id: "b0000002-0001-4001-8001-000000000203",
      label: "収納ユニット",
      modules: [
        {
          id: "c0000002-0001-4001-8001-000000002005",
          label: "排出動作",
          legacyKey: "DEMO-002:b-storage-eject",
        },
      ],
    },
  ],
};

/** 技術デモ — 塗布装置（DEMO0000 · A0001 全量 · ADR-018） */
export const DEMO_DEVICE_COATING: Device = {
  id: "a0000000-0000-4001-8001-000000000000",
  internalCode: "DEMO0000",
  name: "塗布装置",
  units: [
    {
      id: "b0000000-0001-4001-8001-000000000000",
      label: "供給部",
      modules: [
        {
          id: "c0000000-0001-4001-8001-000000000001",
          label: "M000供給ﾏｶﾞｼﾞﾝ_ﾏｶﾞｼﾞﾝｾｯﾄ位置",
        },
        {
          id: "c0000000-0001-4001-8001-000000000002",
          label: "M001供給ﾏｶﾞｼﾞﾝ_SUS板取出位置",
        },
        {
          id: "c0000000-0001-4001-8001-000000000003",
          label: "M002供給SUS板_取",
        },
        {
          id: "c0000000-0001-4001-8001-000000000004",
          label: "M003供給SUS板_置",
        },
        {
          id: "c0000000-0001-4001-8001-000000000005",
          label: "M004供給SUS板_検査",
        },
        {
          id: "c0000000-0001-4001-8001-000000000006",
          label: "M005供給搬送1_取",
        },
        {
          id: "c0000000-0001-4001-8001-000000000007",
          label: "M006供給搬送1_置",
        },
        {
          id: "c0000000-0001-4001-8001-000000000008",
          label: "M007供給搬送1_戻",
        },
      ],
    },
    {
      id: "b0000000-0002-4001-8001-000000000000",
      label: "塗布1部",
      modules: [
        {
          id: "c0000000-0002-4001-8001-000000000001",
          label: "M016塗布1搬送1_取1(供給搬送2)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000002",
          label: "M017塗布1搬送1_取2(塗布TB)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000003",
          label: "M018塗布1搬送2_取3(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000004",
          label: "M019塗布1搬送2_取4(外観検査)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000005",
          label: "M020塗布1搬送2_取5(寸法検査)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000006",
          label: "M021塗布1搬送3_取6(乾燥前)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000007",
          label: "M022塗布1搬送3_取7(予約)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000008",
          label: "M023塗布1搬送3_取8(乾燥)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000009",
          label: "M024塗布1搬送3_取9(冷却)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000010",
          label: "M025塗布1搬送3_取10(塗布1回転1)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000011",
          label: "M026塗布1搬送1_置1(塗布TB)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000012",
          label: "M027塗布1搬送2_置2(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000013",
          label: "M028塗布1搬送2_置3(外観検査)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000014",
          label: "M029塗布1搬送2_置4(寸法検査)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000015",
          label: "M030塗布1搬送3_置5(NG排出)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000016",
          label: "M031塗布1搬送3_置6(乾燥前)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000017",
          label: "M032塗布1搬送3_置7(予約)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000018",
          label: "M033塗布1搬送3_置8(乾燥)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000019",
          label: "M034塗布1搬送3_置9(冷却)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000020",
          label: "M035塗布1搬送3_置10(塗布1回転1)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000021",
          label: "M036塗布1搬送3_置11(塗布1回転2)",
        },
        {
          id: "c0000000-0002-4001-8001-000000000022",
          label: "M037塗布1_工程1.ｾｯﾄ位置",
        },
        {
          id: "c0000000-0002-4001-8001-000000000023",
          label: "M038塗布1_工程2.ﾌﾞﾛｰ",
        },
        {
          id: "c0000000-0002-4001-8001-000000000024",
          label: "M039塗布1_工程3.AL計測",
        },
        {
          id: "c0000000-0002-4001-8001-000000000025",
          label: "M040塗布1_工程4.高さ計測",
        },
        {
          id: "c0000000-0002-4001-8001-000000000026",
          label: "M041塗布1_工程5.塗布",
        },
        {
          id: "c0000000-0002-4001-8001-000000000027",
          label: "M042塗布1_塗布清掃1.ｼｰﾄ",
        },
        {
          id: "c0000000-0002-4001-8001-000000000028",
          label: "M043塗布1_塗布清掃2.ﾛｰﾙ",
        },
        {
          id: "c0000000-0002-4001-8001-000000000029",
          label: "M044塗布1_外観検査",
        },
        {
          id: "c0000000-0002-4001-8001-000000000030",
          label: "M045塗布1_寸法検査",
        },
      ],
    },
    {
      id: "b0000000-0003-4001-8001-000000000000",
      label: "塗布2部",
      modules: [
        {
          id: "c0000000-0003-4001-8001-000000000001",
          label: "M048塗布2搬送1_取1(塗布1回転2)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000002",
          label: "M049塗布2搬送1_取2(塗布TB)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000003",
          label: "M050塗布2搬送2_取3(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000004",
          label: "M051塗布2搬送2_取4(外観検査)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000005",
          label: "M052塗布2搬送2_取5(寸法検査)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000006",
          label: "M053塗布2搬送3_取6(塗布2回転1)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000007",
          label: "M054塗布2搬送3_取7(塗布2回転2)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000008",
          label: "M055塗布2搬送3_取8(乾燥)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000009",
          label: "M056塗布2搬送3_取9(冷却)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000010",
          label: "M057塗布2搬送3_取10(予約)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000011",
          label: "M058塗布2搬送1_置1(塗布TB)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000012",
          label: "M059塗布2搬送1_置2(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000013",
          label: "M060塗布2搬送2_置3(外観検査)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000014",
          label: "M061塗布2搬送2_置4(寸法検査)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000015",
          label: "M062塗布2搬送2_置5(NG排出)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000016",
          label: "M063塗布2搬送2_置6(塗布2回転1)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000017",
          label: "M064塗布2搬送3_置7(塗布2回転2)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000018",
          label: "M065塗布2搬送3_置8(乾燥)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000019",
          label: "M066塗布2搬送3_置9(冷却)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000020",
          label: "M067塗布2搬送3_置10(塗布2仮置)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000021",
          label: "M068塗布2_置11(予約)",
        },
        {
          id: "c0000000-0003-4001-8001-000000000022",
          label: "M069塗布2_工程1.ｾｯﾄ位置",
        },
        {
          id: "c0000000-0003-4001-8001-000000000023",
          label: "M070塗布2_工程2.ﾌﾞﾛｰ",
        },
        {
          id: "c0000000-0003-4001-8001-000000000024",
          label: "M071塗布2_工程3.AL計測",
        },
        {
          id: "c0000000-0003-4001-8001-000000000025",
          label: "M072塗布2_工程4.高さ計測",
        },
        {
          id: "c0000000-0003-4001-8001-000000000026",
          label: "M073塗布2_工程5.塗布",
        },
        {
          id: "c0000000-0003-4001-8001-000000000027",
          label: "M074塗布2_塗布清掃1.ｼｰﾄ",
        },
        {
          id: "c0000000-0003-4001-8001-000000000028",
          label: "M075塗布2_塗布清掃2.ﾛｰﾙ",
        },
        {
          id: "c0000000-0003-4001-8001-000000000029",
          label: "M076塗布2_外観検査",
        },
        {
          id: "c0000000-0003-4001-8001-000000000030",
          label: "M077塗布2_寸法検査",
        },
      ],
    },
    {
      id: "b0000000-0004-4001-8001-000000000000",
      label: "塗布3部",
      modules: [
        {
          id: "c0000000-0004-4001-8001-000000000001",
          label: "M080塗布3搬送1_取1(塗布2仮置)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000002",
          label: "M081塗布3搬送1_取2(塗布TB)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000003",
          label: "M082塗布3搬送1_取3(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000004",
          label: "M083塗布3搬送2_取4(外観検査)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000005",
          label: "M084塗布3搬送2_取5(寸法検査)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000006",
          label: "M085塗布3搬送3_取6(乾燥前)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000007",
          label: "M086塗布3搬送3_取7(予約)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000008",
          label: "M087塗布3搬送3_取8(乾燥)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000009",
          label: "M088塗布3搬送3_取9(冷却)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000010",
          label: "M089塗布3搬送3_取10(予約)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000011",
          label: "M090塗布3搬送1_置1(塗布TB)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000012",
          label: "M091塗布3搬送1_置2(ﾚﾍﾞﾘﾝｸﾞ)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000013",
          label: "M092塗布3搬送2_置3(外観検査)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000014",
          label: "M093塗布3搬送2_置4(寸法検査)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000015",
          label: "M094塗布3搬送2_置5(NG排出)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000016",
          label: "M095塗布3搬送2_置6(乾燥前)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000017",
          label: "M096塗布3搬送3_置7(予約)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000018",
          label: "M097塗布3搬送3_置8(乾燥)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000019",
          label: "M098塗布3搬送3_置9(冷却)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000020",
          label: "M099塗布3搬送3_置10(排出搬送2)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000021",
          label: "M100塗布3搬送3_置11(予約)",
        },
        {
          id: "c0000000-0004-4001-8001-000000000022",
          label: "M101塗布3_工程1.ｾｯﾄ位置",
        },
        {
          id: "c0000000-0004-4001-8001-000000000023",
          label: "M102塗布3_工程2.ﾌﾞﾛｰ",
        },
        {
          id: "c0000000-0004-4001-8001-000000000024",
          label: "M103塗布3_工程3.AL計測",
        },
        {
          id: "c0000000-0004-4001-8001-000000000025",
          label: "M104塗布3_工程4.高さ計測",
        },
        {
          id: "c0000000-0004-4001-8001-000000000026",
          label: "M105塗布3_工程5.塗布",
        },
        {
          id: "c0000000-0004-4001-8001-000000000027",
          label: "M106塗布3_塗布清掃1.ｼｰﾄ",
        },
        {
          id: "c0000000-0004-4001-8001-000000000028",
          label: "M107塗布3_塗布清掃2.ﾛｰﾙ",
        },
        {
          id: "c0000000-0004-4001-8001-000000000029",
          label: "M108塗布3_外観検査",
        },
        {
          id: "c0000000-0004-4001-8001-000000000030",
          label: "M109塗布3_寸法検査",
        },
      ],
    },
    {
      id: "b0000000-0005-4001-8001-000000000000",
      label: "収納部",
      modules: [
        {
          id: "c0000000-0005-4001-8001-000000000001",
          label: "M112収納ﾏｶﾞｼﾞﾝ搬送_ﾏｶﾞｼﾞﾝｾｯﾄ位置",
        },
        {
          id: "c0000000-0005-4001-8001-000000000002",
          label: "M113収納ﾏｶﾞｼﾞﾝ搬送_SUS板取出位置",
        },
        {
          id: "c0000000-0005-4001-8001-000000000003",
          label: "M114収納SUS板搬送_取",
        },
        {
          id: "c0000000-0005-4001-8001-000000000004",
          label: "M115収納SUS板搬送_置",
        },
        {
          id: "c0000000-0005-4001-8001-000000000005",
          label: "M118収納搬送1_取",
        },
        {
          id: "c0000000-0005-4001-8001-000000000006",
          label: "M119収納搬送1_置",
        },
      ],
    },
  ],
};

export const DEMO_DEVICES: Device[] = [DEMO_DEVICE_COATING];

/** @deprecated 互換 — プレス機 A */
export const DEMO_DEVICE = DEMO_DEVICE_PRESS_A;

/** general デモ — 日常の作業（2×2 · ADR-018） */
export const GENERAL_DEMO_DEVICE_DAILY: Device = {
  id: "a0000003-0001-4001-8001-000000000003",
  name: "日常の作業",
  units: [
    {
      id: "b0000003-0001-4001-8001-000000000301",
      label: "料理",
      modules: [
        { id: "c0000003-0001-4001-8001-000000003001", label: "カレーを作る" },
        { id: "c0000003-0001-4001-8001-000000003002", label: "パスタを作る" },
      ],
    },
    {
      id: "b0000003-0002-4001-8001-000000000302",
      label: "掃除",
      modules: [
        {
          id: "c0000003-0002-4001-8001-000000003003",
          label: "キッチンを掃除する",
        },
        { id: "c0000003-0002-4001-8001-000000003004", label: "浴室を掃除する" },
      ],
    },
  ],
};

export const GENERAL_DEMO_DEVICES: Device[] = [GENERAL_DEMO_DEVICE_DAILY];

/** 装置ドロップダウン — 社内番号：display_name */
export function formatDeviceSelectLabel(device: {
  name: string;
  internalCode?: string;
}): string {
  const code = device.internalCode?.trim();
  return code ? `${code}：${device.name}` : device.name;
}

export function findDevice(
  devices: readonly Device[],
  deviceId: string
): Device | null {
  return devices.find((d) => d.id === deviceId) ?? null;
}

/** 装置配下の全動作（ユニット順） */
export function collectDeviceModules(device: Device): FlowModule[] {
  return device.units.flatMap((unit) => unit.modules);
}

export function findModule(
  device: Device,
  moduleId: string
): { unit: FlowUnit; module: FlowModule } | null {
  for (const unit of device.units) {
    const mod = unit.modules.find((m) => m.id === moduleId);
    if (mod) return { unit, module: mod };
  }
  return null;
}

export function findModuleInDevices(
  devices: readonly Device[],
  moduleId: string
): { device: Device; unit: FlowUnit; module: FlowModule } | null {
  for (const device of devices) {
    const found = findModule(device, moduleId);
    if (found) return { device, ...found };
  }
  return null;
}

export function hasModuleInDevices(
  devices: readonly Device[],
  moduleId: string
): boolean {
  return findModuleInDevices(devices, moduleId) !== null;
}

/** 設計メモ保存後にクライアント側の装置ツリーを更新する */
export function patchDesignMemoInDevices(
  devices: readonly Device[],
  target: "device" | "unit" | "module",
  id: string,
  memo: string
): Device[] {
  return devices.map((device) => {
    if (target === "device" && device.id === id) {
      return { ...device, memo };
    }
    return {
      ...device,
      units: device.units.map((unit) => {
        if (target === "unit" && unit.id === id) {
          return { ...unit, memo };
        }
        return {
          ...unit,
          modules: unit.modules.map((mod) =>
            target === "module" && mod.id === id ? { ...mod, memo } : mod
          ),
        };
      }),
    };
  });
}

/** 削除直後のナビ反映用 — 指定モジュールを除外した装置ツリーを返す */
export function excludeModulesFromDevices(
  devices: readonly Device[],
  excludedModuleIds: ReadonlySet<string>
): Device[] {
  if (excludedModuleIds.size === 0) {
    return [...devices];
  }
  return devices.map((device) => ({
    ...device,
    units: device.units
      .map((unit) => ({
        ...unit,
        modules: unit.modules.filter((m) => !excludedModuleIds.has(m.id)),
      }))
      .filter((unit) => unit.modules.length > 0),
  }));
}

/** 読込用 — uuid 優先 · 旧 text キーへフォールバック */
export function resolveModuleDraftKeys(
  module: FlowModule,
  device: Device
): string[] {
  const keys = [moduleStorageKey(module.id)];

  if (module.legacyKey) {
    keys.push(module.legacyKey);
    const slug = module.legacyKey.split(":")[1];
    if (slug) {
      if (device.internalCode === "DEMO-001") {
        keys.push(`press-01:${slug}`, slug);
      } else if (device.internalCode === "DEMO-002") {
        keys.push(`press-02:${slug}`);
      }
    }
  }

  return [...new Set(keys)];
}

/** @deprecated resolveModuleDraftKeys(module, device) を使用 */
export function resolveModuleDraftKey(
  deviceId: string,
  moduleId: string
): string[] {
  const device = findDevice(DEMO_DEVICES, deviceId);
  const found = device ? findModule(device, moduleId) : null;
  if (found) {
    return resolveModuleDraftKeys(found.module, device!);
  }
  return [moduleDraftKey(deviceId, moduleId)];
}
