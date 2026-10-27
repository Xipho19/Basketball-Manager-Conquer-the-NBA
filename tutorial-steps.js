/* COMIC RED / WHITE — L0 coach marks.
   Content only; all behaviour lives in tutorial.js.
   Steps are scene-driven: only the branch the player actually takes appears. */
window.BM_TUTORIAL_STEPS = [
  {
    id: "launcher",
    scene: [".launcher-shell"],
    blockedBy: [".home-load-menu", ".career-mode-screen", ".team-creation-card", ".expansion-shell", ".app-shell"],
    anchor: [".launcher-actions", ".launcher-primary", ".launcher-shell"],
    title: "先选一个入口",
    body: "「开始新游戏」会创建一支新球队；「读取存档」和「继续上次进度」会回到已有生涯。",
    placement: "bottom",
    primary: "知道了"
  },
  {
    id: "slot",
    scene: [".home-load-menu"],
    blockedBy: [".career-mode-screen", ".team-creation-card", ".expansion-shell", ".app-shell"],
    anchor: [".home-load-slots", ".home-load-menu"],
    title: "6 个存档槽位",
    body: "每个槽位是一段独立生涯。游戏会自动保存，也可以在设置里手动存/读档。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "mode",
    scene: [".career-mode-screen"],
    blockedBy: [".team-creation-card", ".expansion-shell", ".app-shell"],
    anchor: [".career-mode-grid", ".career-mode-screen"],
    title: "选一种开局",
    body: "扩军建队从零开始，挑战更大；接手球队有现成阵容，更适合第一次玩。两种都能随时重开。",
    placement: "bottom",
    primary: "下一步"
  },

  /* ---------- expansion branch ---------- */
  {
    id: "team",
    scene: [".team-creation-card"],
    anchor: [".team-name-options", ".team-name-preview", ".team-creation-card"],
    title: "建立你的球队",
    body: "城市、队徽和队名只影响外观，不影响球员能力。选好名字后进入扩军选秀。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "rights",
    scene: [".rights-draw-screen"],
    anchor: [".rights-package-lottery", ".rights-lottery-arena", ".rights-draw-screen"],
    title: "选扩军权益",
    body: "方案 A 优先即战力，方案 B 优先新秀顺位。只能选一份，另一份自动归电脑球队。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "expansion",
    scene: [".reference-trade-desk", ".offer-list"],
    anchor: [".offer-list", ".reference-trade-desk", ".primary-cta"],
    title: "扩军交易桌",
    body: "30 支球队各保护 8 名球员，剩下的进入扩军池。你最多接受 5 份协议，先看年薪和剩余合同，别把空间锁死。",
    placement: "top",
    primary: "明白了"
  },
  {
    id: "expansion-draft",
    scene: [".reference-expansion-draft", ".prototype-expansion-draft"],
    anchor: [".draft-current-roster-panel", ".draft-cap-dashboard", ".draft-available-player-panel"],
    title: "扩军选秀：选满 14 人",
    body: "你和另一支扩军队各选 14 人。先看工资帽和位置缺口，选中后会实时加入阵容。",
    placement: "top",
    primary: "明白了"
  },

  /* ---------- takeover branch ---------- */
  {
    id: "takeover-team",
    scene: [".existing-team-picker", ".existing-team-selection-shell"],
    blockedBy: [".existing-notice-shell", ".existing-protection-shell", ".existing-opening-shell", ".existing-draft-feed", ".existing-team-expansion-summary"],
    anchor: [".existing-team-grid", ".existing-team-options", ".existing-team-preview"],
    title: "选择接手球队",
    body: "先看阵容核心、球队实力和薪资空间。争冠队压力大，年轻队空间多；第一次玩可以选阵容完整的球队。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "takeover-notice",
    scene: [".existing-notice-shell"],
    blockedBy: [".existing-protection-shell", ".existing-opening-shell", ".existing-draft-feed", ".existing-team-expansion-summary"],
    anchor: [".existing-notice-process", ".existing-notice-action", ".existing-notice-inner"],
    title: "接手后的第一步",
    body: "联盟扩军前，你要先结算合同选项、提交 8 人保护名单；之后两支新军各选 14 人，本队最多损失 1 人。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "options",
    optional: true,
    scene: [".option-phase-hero", ".option-phase-list"],
    anchor: [".option-phase-list", ".option-phase-actions", ".option-phase-hero"],
    title: "合同选项",
    body: "球队选项和球员选项会影响薪资与阵容。处理完选项，才会进入保护名单。",
    placement: "top",
    primary: "继续"
  },
  {
    id: "protection",
    scene: [".existing-protection-shell", ".existing-protection"],
    blockedBy: [".existing-opening-preparation", ".existing-draft-feed", ".existing-team-expansion-summary"],
    anchor: [".existing-protection-list", ".existing-protection-submit", ".existing-protection-heading"],
    title: "保护 8 名球员",
    body: "选中 8 名保护球员，其余进入扩军池。推荐名单可以一键恢复；提交后名单冻结，本队最多损失 1 人。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "existing-opening",
    scene: [".existing-opening-preparation"],
    blockedBy: [".existing-draft-feed", ".existing-team-expansion-summary"],
    anchor: [".existing-opening-metrics", ".existing-opening-actions", ".existing-opening-preparation"],
    title: "保护名单已冻结",
    body: "两支新军按蛇形顺序各选 14 人。你的保护名单已生效，本队最多损失 1 人。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "existing-draft",
    scene: [".existing-draft-feed", ".existing-draft-broadcast"],
    blockedBy: [".existing-team-expansion-summary"],
    anchor: [".existing-draft-progress", ".existing-draft-feed", ".existing-draft-fast-forward"],
    title: "扩军选秀直播",
    body: "可以逐签查看，也可以快速结算全部选择。结束后会显示本队是否有球员离队。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "existing-result",
    scene: [".existing-result-heading"],
    anchor: [".existing-result-metrics", ".existing-result-roster", ".existing-result-heading"],
    title: "扩军结果",
    body: "如果有球员被选走，这里会显示离队球员、释放年薪和剩余阵容；补偿资产会进入你的选秀权。",
    placement: "top",
    primary: "下一步"
  },

  /* ---------- shared offseason ---------- */
  {
    id: "draft",
    scene: [".draft-prep-hero", ".rookie-draft-terminal", ".reference-rookie-draft"],
    anchor: [".draft-terminal-cta", ".gemini-draft-main", ".draft-prep-hero"],
    title: "新秀选秀",
    body: "先看球探报告，再等自己的签位。能力范围只是估计，潜力和位置需求同样重要；选秀期间可以交易签位。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "post-draft",
    scene: [".post-draft-terminal"],
    blockedBy: [".free-agency-terminal", ".preseason-terminal"],
    anchor: [".post-draft-rookie-list", ".post-draft-rookie-card", ".post-draft-cap-grid"],
    title: "选秀后：先签新秀",
    body: "选中的新秀要签约或放弃，资质报价也要处理。名单上限 21 人，处理完才能进入自由市场。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "free-agency",
    scene: [".free-agency-terminal", ".fa-reference-market"],
    blockedBy: [".preseason-terminal"],
    anchor: [".free-agency-player-list", ".fa-cap-accounting", ".fa-market-heading"],
    title: "自由市场",
    body: "先看帽下空间和名单人数。名单已满时先裁员才能报价；报价会占用薪资空间，别把后续操作锁死。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "preseason",
    scene: [".preseason-terminal"],
    anchor: [".preseason-training-control", ".preseason-training-metric", ".preseason-terminal"],
    title: "季前训练",
    body: "给球员指定训练重点，提升状态或潜力。训练名额有限，优先给核心和年轻球员。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "roster-cut",
    scene: [".preseason-terminal", ".post-draft-roster-cut-list"],
    anchor: [".preseason-waive-button", ".preseason-player-actions", ".team-roster-panel-preseason", ".post-draft-roster-cut-list"],
    title: "开季前必须裁员",
    body: "常规赛名单只能保留 14～15 人，现在需要裁掉超出的人。裁员会保留剩余保障工资并计入死钱。",
    placement: "top",
    primary: "明白了"
  },

  /* ---------- first season ---------- */
  {
    id: "career",
    scene: [".season-navigation"],
    blockedBy: [".preseason-terminal", ".free-agency-terminal", ".post-draft-terminal", ".rookie-draft-terminal", ".reference-expansion-draft", ".existing-team-expansion-summary"],
    anchor: [".season-navigation"],
    title: "五个主菜单",
    body: "赛季看比赛，管理调轮换，市场做交易，联盟看排名，生涯查荣誉。先从「赛季」开始。",
    placement: "top",
    primary: "下一步"
  },
  {
    id: "rotation",
    optional: true,
    scene: [".rotation-editor"],
    anchor: [".rotation-minute-list", ".rotation-editor"],
    title: "首发和轮换",
    body: "首发决定开局，分钟分配决定赛季长度。注意体力和伤病，别把主力用到透支。",
    placement: "top",
    primary: "知道了"
  },
  {
    id: "season",
    scene: [".season-command-center"],
    anchor: [".season-command-primary", ".season-command-center"],
    title: "从这里推进赛季",
    body: "点这里模拟下一场；「连续模拟」会一次推进多场。背靠背之前，先看体力和伤病。",
    placement: "top",
    primary: "完成引导"
  },
  {
    id: "league",
    optional: true,
    scene: [".league-standings-card"],
    anchor: [".league-standings-card"],
    title: "随时看排名",
    body: "联盟页能看到分区排名和季后赛形势。常规赛目标很简单：先进季后赛。",
    placement: "bottom",
    primary: "知道了"
  }
];
