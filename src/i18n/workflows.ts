import type { Locale } from './config';

export type WorkflowMessages = {
  eyebrow: string;
  title: string;
  description: string;
  privacy: string;
  recipe: string;
  blank: string;
  addTool: string;
  add: string;
  run: string;
  running: string;
  reset: string;
  loadExample: string;
  remove: string;
  node: string;
  input: string;
  output: string;
  result: string;
  connectFrom: string;
  unconnected: string;
  connected: string;
  nodeReady: string;
  nodeComplete: string;
  nodeError: string;
  skipped: string;
  import: string;
  export: string;
  recipeOnly: string;
  imported: string;
  exported: string;
  importError: string;
  runError: string;
  invalidGraph: string;
  cycleError: string;
  branchError: string;
  noNodes: string;
  stepHint: string;
  openGuide: string;
  toolsInRecipe: string;
  readingLabel: string;
  boundaryLabel: string;
};

export const workflowUiMessages: Record<Locale, WorkflowMessages> = {
  ko: {
    eyebrow: '브라우저 워크플로 스튜디오', title: '개발 작업을 연결해 실행하세요',
    description: '도구 노드를 추가하고, 같은 데이터 유형의 출력과 입력을 연결합니다. 단계별 결과를 확인하며 재사용 가능한 레시피를 편집하세요.',
    privacy: '입력과 실행 결과는 현재 브라우저 탭의 메모리에서만 처리합니다. 레시피 파일에는 노드와 연결만 저장되며 입력·결과·로그를 포함하지 않습니다.',
    recipe: '시작 레시피', blank: '빈 캔버스', addTool: '도구 추가', add: '노드 추가', run: '전체 실행', running: '실행 중…', reset: '레시피 다시 불러오기',
    loadExample: '안전한 예제 입력 채우기', remove: '노드 삭제', node: '단계', input: '입력 포트', output: '출력', result: '단계 결과',
    connectFrom: '연결할 이전 단계 선택', unconnected: '수동 입력 사용', connected: '연결됨: 이전 단계 결과 사용', nodeReady: '실행 대기', nodeComplete: '완료', nodeError: '오류', skipped: '앞 단계 오류로 건너뜀',
    import: '레시피 가져오기', export: '레시피 내보내기', recipeOnly: 'JSON에는 레시피 구조만 포함됩니다. 현재 입력과 결과는 파일에 넣지 않습니다.',
    imported: '레시피를 가져왔습니다. 입력 값은 포함되지 않습니다.', exported: '구조만 내보냈습니다.', importError: '올바른 DevDesk 레시피 JSON이 아닙니다.', runError: '필수 입력을 확인한 뒤 다시 실행하세요.',
    invalidGraph: '연결을 적용할 수 없습니다. 포트 유형과 노드 연결을 확인하세요.', cycleError: '순환 연결은 허용되지 않습니다.', branchError: '첫 버전은 한 출력에서 두 단계로 갈라지는 연결을 지원하지 않습니다.',
    noNodes: '도구를 추가하면 작업 흐름을 구성할 수 있습니다.', stepHint: '위에서 아래 순서로 실행합니다. 키보드로 탭 이동 후 연결 선택 목록에서 단계를 연결할 수 있습니다.',
    openGuide: '실전 가이드 보기', toolsInRecipe: '도구 설명', readingLabel: '판독', boundaryLabel: '한계',
  },
  en: {
    eyebrow: 'Browser workflow studio', title: 'Connect developer tasks and run them',
    description: 'Add tool nodes and connect outputs to inputs with matching data types. Inspect each result and edit reusable recipes.',
    privacy: 'Inputs and results stay in this browser tab’s memory. Recipe files contain node and connection structure only; they exclude inputs, results, and logs.',
    recipe: 'Starter recipe', blank: 'Blank canvas', addTool: 'Add a tool', add: 'Add node', run: 'Run all steps', running: 'Running…', reset: 'Reload recipe',
    loadExample: 'Fill safe example inputs', remove: 'Remove node', node: 'Step', input: 'Input ports', output: 'Output', result: 'Step result',
    connectFrom: 'Choose a previous step to connect', unconnected: 'Use manual input', connected: 'Connected: use the previous step result', nodeReady: 'Waiting to run', nodeComplete: 'Complete', nodeError: 'Error', skipped: 'Skipped after an earlier error',
    import: 'Import recipe', export: 'Export recipe', recipeOnly: 'The JSON contains recipe structure only. Current inputs and results are excluded.',
    imported: 'Recipe imported. It contains no input values.', exported: 'Structure exported only.', importError: 'This is not a valid DevDesk recipe JSON file.', runError: 'Check required inputs and run the workflow again.',
    invalidGraph: 'This connection is not valid. Check port types and node connections.', cycleError: 'Cycles are not allowed.', branchError: 'The first version does not allow one output to branch to two steps.',
    noNodes: 'Add a tool to start building a workflow.', stepHint: 'Steps run from top to bottom. Use Tab to focus a connection menu and select a step with the keyboard.',
    openGuide: 'Read the practical guide', toolsInRecipe: 'Tool details', readingLabel: 'How to read it', boundaryLabel: 'Limit',
  },
  ja: {
    eyebrow: 'ブラウザー・ワークフロースタジオ', title: '開発タスクをつないで実行',
    description: 'ツールノードを追加し、同じデータ型の出力と入力を接続します。各段階の結果を確認し、再利用できるレシピを編集できます。',
    privacy: '入力と実行結果はこのブラウザータブのメモリ内だけで処理します。レシピファイルにはノードと接続だけを保存し、入力・結果・ログは含めません。',
    recipe: '開始レシピ', blank: '空のキャンバス', addTool: 'ツールを追加', add: 'ノードを追加', run: 'すべて実行', running: '実行中…', reset: 'レシピを再読み込み',
    loadExample: '安全な入力例を設定', remove: 'ノードを削除', node: 'ステップ', input: '入力ポート', output: '出力', result: 'ステップ結果',
    connectFrom: '接続元の前ステップを選択', unconnected: '手動入力を使用', connected: '接続済み：前のステップの結果を使用', nodeReady: '実行待ち', nodeComplete: '完了', nodeError: 'エラー', skipped: '前のステップのエラーによりスキップ',
    import: 'レシピを読み込む', export: 'レシピをエクスポート', recipeOnly: 'JSON にはレシピ構造だけが含まれます。現在の入力と結果は保存しません。',
    imported: 'レシピを読み込みました。入力値は含まれていません。', exported: '構造だけをエクスポートしました。', importError: '有効な DevDesk レシピ JSON ではありません。', runError: '必須入力を確認してから再実行してください。',
    invalidGraph: '接続できません。ポートの型とノードの接続を確認してください。', cycleError: '循環接続は許可されていません。', branchError: '最初のバージョンでは、1 つの出力から複数のステップへの分岐はできません。',
    noNodes: 'ツールを追加してワークフローを作成します。', stepHint: '上から順に実行します。Tab キーで接続メニューに移動し、キーボードでステップを選択できます。',
    openGuide: '実践ガイドを読む', toolsInRecipe: 'ツールの詳細', readingLabel: '読み方', boundaryLabel: '制限',
  },
  zh: {
    eyebrow: '浏览器工作流工作室', title: '连接开发任务并运行',
    description: '添加工具节点，并将数据类型相同的输出连接到输入。逐步查看结果并编辑可复用的配方。',
    privacy: '输入和运行结果仅保存在当前浏览器标签页的内存中。配方文件只包含节点和连接结构，不包含输入、结果或日志。',
    recipe: '起始配方', blank: '空白画布', addTool: '添加工具', add: '添加节点', run: '运行全部步骤', running: '运行中…', reset: '重新加载配方',
    loadExample: '填入安全示例', remove: '删除节点', node: '步骤', input: '输入端口', output: '输出', result: '步骤结果',
    connectFrom: '选择要连接的前一步', unconnected: '使用手动输入', connected: '已连接：使用前一步结果', nodeReady: '等待运行', nodeComplete: '完成', nodeError: '错误', skipped: '前一步出错，已跳过',
    import: '导入配方', export: '导出配方', recipeOnly: 'JSON 仅包含配方结构，不包含当前输入和结果。',
    imported: '已导入配方，其中不含输入值。', exported: '仅导出了结构。', importError: '这不是有效的 DevDesk 配方 JSON 文件。', runError: '请检查必填输入后重新运行。',
    invalidGraph: '无法应用此连接。请检查端口类型和节点连接。', cycleError: '不允许循环连接。', branchError: '首个版本不支持从一个输出分支连接到多个步骤。',
    noNodes: '添加工具以开始构建工作流。', stepHint: '步骤从上到下运行。按 Tab 聚焦连接菜单，再使用键盘选择步骤。',
    openGuide: '查看实战指南', toolsInRecipe: '工具说明', readingLabel: '结果解读', boundaryLabel: '限制',
  },
};
