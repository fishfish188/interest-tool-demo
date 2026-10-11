(function () {
  const data = window.DETAIL_DATA;
  if (!data) return;

  const params = new URLSearchParams(window.location.search);
  const isMineMode = params.get("source") === "mine";
  const statusMap = {
    try: { text: "想尝试", className: "status-try" },
    ing: { text: "进行中", className: "status-ing" },
    giveup: { text: "已放弃", className: "status-giveup" }
  };
  const savedList = JSON.parse(localStorage.getItem("interestSavedList") || "[]");
  const savedItem = savedList.find((item) => item.name === data.name);
  let currentStatus = statusMap[params.get("status")] ? params.get("status") : (savedItem?.status || "try");
  const openSections = {
    timeline: !isMineMode,
    gear: !isMineMode,
    resource: true,
    local: true,
    checkin: isMineMode && currentStatus === "ing"
  };

  const tags = data.tags.map((tag) => `<span class="label ${data.toneClass || ""}">${tag}</span>`).join("");
  const timeline = data.timeline.map((item, index) => `
      <article class="timeline-item">
        <span class="timeline-no">${index + 1}</span>
        <h3 class="timeline-heading">${item.period}</h3>
        <p class="timeline-meta timeline-action">
          <img src="assets/icon-layout-horizontal-line.svg" alt="" aria-hidden="true">
          <span>${item.action}</span>
        </p>
        <p class="timeline-meta timeline-price">
          <img src="assets/icon-money-cny-circle-line.svg" alt="" aria-hidden="true">
          <span>${item.cost}</span>
        </p>
      </article>`).join("");
  function truncateResourceTitle(title) {
    return title.length > 9 ? `${title.slice(0, 9)}…` : title;
  }

  const resourceGroups = data.resources && !Array.isArray(data.resources) ? data.resources : { video: data.resources || [] };
  const resourceLabels = { video: "视频教程", article: "图文教程", creator: "博主跟练" };
  function renderResources(group = "video") {
    return (resourceGroups[group] || []).map((item) => {
      const resource = typeof item === "string" ? { title: item, url: "#" } : item;
      return `
      <a class="resource-card${resource.placeholder ? " resource-card-placeholder" : ""}" href="${resource.url || "#"}" ${resource.url && resource.url !== "#" ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        ${resource.image ? `<img class="resource-thumb" src="${resource.image}" alt="" aria-hidden="true">` : ""}
        <span>${truncateResourceTitle(resource.title)}</span>
        <span class="resource-arrow" aria-hidden="true"><img src="assets/icon-arrow-right-s-line.svg" alt=""></span>
      </a>`;
    }).join("");
  }
  const resources = renderResources();
  const places = data.places || (data.place ? [data.place] : []);
  const placeCards = places.map((place) => `
      <a class="place-card" data-price="${Number.parseFloat(String(place.price).replace(/[^\d.]/g, "")) || 0}" href="${place.url || "#"}" ${place.url ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        <h4 class="place-name">${place.name}</h4>
        <p class="place-meta">
          <span>${place.price}</span>
          <span>${place.distance}</span>
        </p>
        <img class="corner-icon" src="assets/icon-corner-up-right-line.svg" alt="" aria-hidden="true">
      </a>`).join("");
  function getCurrentWeek() {
    const dayNames = ["一", "二", "三", "四", "五", "六", "日"];
    const today = new Date();
    const monday = new Date(today);
    const dayIndex = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - dayIndex);
    return dayNames.map((day, index) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + index);
      return {
        day,
        date: String(current.getDate()).padStart(2, "0"),
        iso: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
      };
    });
  }

  const weekdays = getCurrentWeek();
  const calendar = weekdays.map((day, index) => `
      <button class="calendar-day" type="button" data-day="${index}" data-date="${day.iso}">
        <span>${day.day}</span>
        <strong>${day.date}</strong>
      </button>`).join("");

  document.title = `${data.name}详情`;
  document.body.innerHTML = `
  <main class="detail-page ${isMineMode ? "mine-detail" : "plaza-detail"}" aria-label="${data.name}详情">
    <div class="page-bg" aria-hidden="true"></div>
    <a class="back-link" href="${isMineMode ? "mine.html" : "explore.html"}">
      <img src="assets/icon-arrow-left-s-line.svg" alt="" aria-hidden="true">
      <span>返回</span>
    </a>
    <section class="intro-card" aria-label="${data.name}介绍">
      <img class="intro-icon" src="${data.icon}" alt="" aria-hidden="true">
      <div class="intro-title-row">
        <h1 class="intro-title">${data.name}</h1>
        ${isMineMode ? `
          <button class="status-select ${statusMap[currentStatus].className}" type="button" aria-expanded="false">
            <span>${statusMap[currentStatus].text}</span>
            <img src="assets/icon-arrow-down-s-line.svg" alt="" aria-hidden="true">
          </button>
          <div class="status-menu" hidden>
            <button type="button" data-status="try">想尝试</button>
            <i></i>
            <button type="button" data-status="ing">进行中</button>
            <i></i>
            <button type="button" data-status="giveup">已放弃</button>
          </div>` : `<span class="label ${data.toneClass || ""}">${data.category}</span>`}
      </div>
      <p class="intro-cost">启动资金：${data.fund}</p>
      <div class="label-row" aria-label="兴趣标签">${tags}</div>
    </section>

    <h2 class="group-title timeline-title" data-section="timeline">
      <span class="title-mark"><img src="assets/title-arrow.svg" alt="" aria-hidden="true"></span>
      <span>阶段化入门计划</span>
    </h2>
    <button class="section-toggle timeline-toggle" type="button" data-section="timeline" aria-label="展开或收起阶段化入门计划">
      <img src="assets/icon-arrow-up-s-line.svg" alt="" aria-hidden="true">
    </button>
    <section class="panel timeline-panel" data-panel="timeline" aria-label="阶段化入门计划">${timeline}</section>

    <h2 class="group-title gear-title" data-section="gear">
      <span class="title-mark"><img src="assets/title-arrow.svg" alt="" aria-hidden="true"></span>
      <span>装备清单</span>
    </h2>
    <button class="section-toggle gear-toggle" type="button" data-section="gear" aria-label="展开或收起装备清单">
      <img src="assets/icon-arrow-up-s-line.svg" alt="" aria-hidden="true">
    </button>
    <section class="panel gear-panel" data-panel="gear" aria-label="装备清单">
      <h3 class="subhead gear-low">低成本入门</h3>
      <article class="gear-card low">
        <h4 class="gear-name">${data.gear.low.name}</h4>
        <p class="gear-note">${data.gear.low.note}</p>
        <img class="corner-icon" src="assets/icon-corner-up-right-line.svg" alt="" aria-hidden="true">
      </article>
      <h3 class="subhead gear-pro">进阶升级</h3>
      <article class="gear-card pro">
        <h4 class="gear-name">${data.gear.pro.name}</h4>
        <p class="gear-note">${data.gear.pro.note}</p>
        <img class="corner-icon" src="assets/icon-corner-up-right-line.svg" alt="" aria-hidden="true">
      </article>
    </section>

    <h2 class="group-title resource-title" data-section="resource">
      <span class="title-mark"><img src="assets/title-arrow.svg" alt="" aria-hidden="true"></span>
      <span>资源链接</span>
    </h2>
    <button class="section-toggle resource-toggle" type="button" data-section="resource" aria-label="展开或收起资源链接">
      <img src="assets/icon-arrow-up-s-line.svg" alt="" aria-hidden="true">
    </button>
    <div class="resource-tabs" data-panel="resource" aria-label="资源筛选">
      <button class="pill is-active" type="button">视频教程</button>
      <button class="pill" type="button">图文教程</button>
      <button class="pill" type="button">博主跟练</button>
    </div>
    <section class="resource-cards" data-panel="resource" aria-label="资源卡片">${resources}</section>

    <h2 class="group-title local-title" data-section="local">
      <span class="title-mark"><img src="assets/title-arrow.svg" alt="" aria-hidden="true"></span>
      <span>本地体验推荐</span>
    </h2>
    <button class="section-toggle local-toggle" type="button" data-section="local" aria-label="展开或收起本地体验推荐">
      <img src="assets/icon-arrow-up-s-line.svg" alt="" aria-hidden="true">
    </button>
    <div class="sort-tabs" data-panel="local" aria-label="推荐排序">
      <button class="sort-pill is-active" type="button">
        <span>价格</span>
        <img src="assets/sort-asc.svg" alt="" aria-hidden="true">
      </button>
      <button class="sort-pill" type="button">
        <span>距离</span>
        <img src="assets/sort-asc.svg" alt="" aria-hidden="true">
      </button>
    </div>
      <section class="panel local-panel" data-panel="local" aria-label="本地体验推荐">
      <h3 class="local-heading">
        <img src="assets/icon-map-pin-line.svg" alt="" aria-hidden="true">
        <span>位置位置</span>
      </h3>
      ${placeCards}
    </section>

    <h2 class="group-title checkin-title" data-section="checkin">
      <span class="title-mark"><img src="assets/title-arrow.svg" alt="" aria-hidden="true"></span>
      <span>打卡/记录</span>
    </h2>
    <button class="section-toggle checkin-toggle" type="button" data-section="checkin" aria-label="展开或收起打卡/记录">
      <img src="assets/icon-arrow-up-s-line.svg" alt="" aria-hidden="true">
    </button>
    <section class="panel checkin-panel" data-panel="checkin" aria-label="打卡/记录">
      <div class="checkin-head">
        <span>本周记录/ 已打卡<span class="checkin-count">0</span>天</span>
        <a class="checkin-all" href="checkin-records.html?fresh=sync2">查看全部</a>
      </div>
      <div class="calendar-grid">${calendar}</div>
      <div class="agenda-list" aria-label="日程内容">
        <article class="agenda-item">
          <span class="agenda-time">19:30</span>
          <div>
            <strong>${data.name}练习</strong>
            <p data-full-text="上了一节体验课，教了基础抓提，但不很敢爬，就怕摔下来，回去得学习下怎么落地先">上了一节体验课，教了基础抓提，但不很敢爬，就怕摔下来，回去得学习下怎么落地先</p>
          </div>
          <button class="agenda-edit-button" type="button" aria-label="编辑记录">
            <img class="agenda-edit-icon" src="assets/icon-edit-2-line.svg" alt="" aria-hidden="true">
          </button>
        </article>
      </div>
      <button class="checkin-add-button" type="button">添加记录</button>
    </section>

    <div class="action-tip" role="status" aria-live="polite" hidden></div>
    <button class="add-button" type="button">${isMineMode ? "删除兴趣" : "添加到我的清单"}</button>
    <div class="record-overlay" hidden>
      <div class="record-mask" aria-hidden="true"></div>
      <section class="record-sheet" aria-label="编辑打卡记录">
        <label class="record-title-label" for="record-title">标题</label>
        <input class="record-title-input" id="record-title" type="text" placeholder="请输入...">
        <label class="record-content-label" for="record-content">内容</label>
        <textarea class="record-text" id="record-content" aria-label="内容" placeholder="请输入..."></textarea>
        <button class="record-cancel-button" type="button">取消</button>
        <button class="record-confirm-button" type="button">确认</button>
      </section>
    </div>
  </main>`;

  const style = document.createElement("style");
  style.textContent = `
    @font-face { font-family: "JiangChengYuanTi"; src: url("assets/fonts/JiangChengYuanTi-400.ttf") format("truetype"); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: "JiangChengYuanTi"; src: url("assets/fonts/JiangChengYuanTi-500.ttf") format("truetype"); font-weight: 500; font-style: normal; font-display: swap; }
    @font-face { font-family: "JiangChengYuanTi"; src: url("assets/fonts/JiangChengYuanTi-600.ttf") format("truetype"); font-weight: 600; font-style: normal; font-display: swap; }
    :root { --page: #FDF5EA; --ink: #100F0F; --yellow: #FCD611; --label-yellow: #FDDE19; --green: #CDF12D; --blue: #10D8FD; --card-border: 2px solid #100F0F; --card-shadow: 2px 2px 0px #100F0F; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body { min-height: 100%; background: var(--page); color: var(--ink); font-family: "JiangChengYuanTi", YouYuan, "幼圆", "Microsoft YaHei", sans-serif; letter-spacing: 0; }
    body { display: flex; justify-content: center; overflow-x: hidden; }
    button, input { color: inherit; font: inherit; border: 0; background: none; }
    button { cursor: pointer; }
    a { color: inherit; text-decoration: none; }
    img { display: block; user-select: none; -webkit-user-drag: none; }
    .detail-page { position: relative; width: 430px; height: var(--detail-height, 1534px); flex: 0 0 430px; overflow: hidden; transform-origin: top center; }
    .page-bg { position: absolute; width: 430px; height: 932px; left: 0; top: 0; background: linear-gradient(180deg, rgba(205, 241, 45, 0.5) 0%, #FDF5EA 60%); pointer-events: none; z-index: 0; }
    .back-link { position: absolute; left: 16px; top: 28px; width: 92px; height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 8px; font-weight: 500; font-size: 18px; line-height: 18px; z-index: 3; transition: transform 120ms ease, box-shadow 120ms ease; }
    .back-link img { width: 20px; height: 20px; object-fit: contain; }
    .intro-card { position: absolute; left: 16px; top: 88px; width: 398px; height: 138px; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 16px; z-index: 1; }
    .intro-icon { position: absolute; width: 139px; height: 139px; left: -10px; top: -1px; object-fit: contain; }
    .intro-title-row { position: absolute; left: 126px; top: 20px; display: flex; align-items: center; gap: 6px; height: 18px; }
    .intro-title { font-weight: 600; font-size: 18px; line-height: 18px; white-space: nowrap; }
    .label-row { position: absolute; left: 126px; top: 76px; display: flex; gap: 6px; }
    .label { height: 16px; padding: 2px 8px; background: var(--label-yellow); border-radius: 3px; font-weight: 400; font-size: 12px; line-height: 12px; white-space: nowrap; }
    .label.green { background: var(--green); }
    .label.blue { background: var(--blue); }
    .intro-cost { position: absolute; left: 126px; top: 50px; height: 14px; font-weight: 500; font-size: 14px; line-height: 14px; }
    .status-select { width: 72px; height: 16px; padding: 0 8px; display: flex; flex-direction: row; align-items: center; gap: 4px; background: var(--green); border-radius: 3px; font-weight: 400; font-size: 12px; line-height: 12px; white-space: nowrap; z-index: 5; }
    .status-select img { width: 16px; height: 16px; object-fit: contain; }
    .status-select.status-try { background: var(--yellow); }
    .status-select.status-ing { background: var(--green); }
    .status-select.status-giveup { background: var(--blue); }
    .status-menu { position: absolute; width: 74px; height: 114px; left: 0; top: 20px; background: #FFFFFF; border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 12px; z-index: 8; }
    .status-menu button { position: absolute; left: 14px; width: 42px; height: 14px; font-weight: 500; font-size: 14px; line-height: 14px; text-align: left; }
    .status-menu button:nth-of-type(1) { top: 12px; }
    .status-menu button:nth-of-type(2) { top: 50px; }
    .status-menu button:nth-of-type(3) { top: 88px; }
    .status-menu i { position: absolute; left: 14px; width: 42px; height: 0; border-top: 1px solid #E3E3E3; border-radius: 1px; }
    .status-menu i:nth-of-type(1) { top: 38px; }
    .status-menu i:nth-of-type(2) { top: 76px; }
    .group-title { position: absolute; left: 32px; height: 14px; display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 14px; line-height: 14px; z-index: 2; }
    .title-mark img { width: 9px; height: 8px; object-fit: contain; }
    .section-toggle { position: absolute; width: 16px; height: 16px; left: 382px; z-index: 3; }
    .section-toggle img { width: 16px; height: 16px; object-fit: contain; }
    .panel { position: absolute; left: 16px; width: 398px; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 16px; z-index: 1; }
    .is-collapsed { display: none !important; }
    .timeline-panel { height: 301px; }
    .timeline-item { position: absolute; left: 16px; width: 350px; height: 74px; }
    .timeline-item:nth-child(1) { top: 16px; }
    .timeline-item:nth-child(2) { top: 110px; }
    .timeline-item:nth-child(3) { top: 204px; }
    .timeline-no { position: absolute; left: 0; top: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--label-yellow); border: 1px solid var(--ink); border-radius: 50%; font-weight: 500; font-size: 16px; line-height: 16px; }
    .timeline-heading { position: absolute; left: 34px; top: 3px; height: 18px; font-weight: 500; font-size: 18px; line-height: 18px; }
    .timeline-meta { position: absolute; left: 34px; display: flex; align-items: center; gap: 4px; height: 16px; font-weight: 500; font-size: 14px; line-height: 14px; }
    .timeline-meta img { width: 16px; height: 16px; object-fit: contain; }
    .timeline-action { top: 33px; }
    .timeline-price { top: 59px; }
    .gear-panel { height: 252px; }
    .subhead { position: absolute; left: 16px; height: 16px; font-weight: 500; font-size: 16px; line-height: 16px; }
    .gear-low { top: 16px; }
    .gear-pro { top: 132px; }
    .gear-card { position: absolute; left: 16px; width: 366px; height: 74px; background: #FFFFFF; border-radius: 12px; }
    .gear-card.low { top: 42px; }
    .gear-card.pro { top: 158px; }
    .gear-name { position: absolute; left: 16px; top: 16px; height: 16px; font-weight: 600; font-size: 16px; line-height: 16px; }
    .gear-note { position: absolute; left: 16px; top: 44px; height: 14px; font-weight: 500; font-size: 14px; line-height: 14px; }
    .corner-icon { position: absolute; width: 24px; height: 24px; right: 16px; top: 25px; object-fit: contain; }
    .resource-tabs { position: absolute; left: 32px; display: flex; gap: 12px; z-index: 2; }
    .pill { width: 84px; height: 30px; padding: 8px 14px; display: flex; align-items: center; justify-content: center; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 12px; font-weight: 500; font-size: 14px; line-height: 14px; white-space: nowrap; transition: transform 120ms ease, box-shadow 120ms ease; }
    .pill.is-active { background: var(--yellow); }
    .resource-cards { position: absolute; left: 16px; display: grid; grid-template-columns: repeat(3, 122px); gap: 16px; z-index: 1; }
    .resource-card { position: relative; width: 122px; height: 127px; padding: 12px; display: grid; align-content: space-between; overflow: hidden; background: transparent; border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 16px; font-weight: 500; font-size: 14px; line-height: 18px; isolation: isolate; }
    .resource-thumb { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1; filter: none; mix-blend-mode: normal; z-index: 0; }
    .resource-card-placeholder .resource-thumb { object-fit: contain; background: var(--page); }
    .resource-card-placeholder .resource-arrow { display: none; }
    .resource-card > span { position: relative; z-index: 1; }
    .resource-card > span:first-of-type { visibility: hidden; }
    .resource-arrow { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; justify-self: end; background: rgba(255, 255, 255, 0.75); border-radius: 50%; }
    .resource-arrow img { width: 12px; height: 12px; object-fit: contain; }
    .sort-tabs { position: absolute; left: 32px; display: flex; gap: 12px; z-index: 2; }
    .sort-pill { width: 76px; height: 32px; padding: 8px 14px; display: flex; align-items: center; justify-content: center; gap: 4px; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 12px; font-weight: 500; font-size: 14px; line-height: 14px; white-space: nowrap; }
    .sort-pill.is-active { background: var(--yellow); }
    .sort-pill img { width: 16px; height: 16px; object-fit: contain; }
    .local-panel { height: auto; box-sizing: border-box; padding: 16px 16px 20px; }
    .local-heading { position: relative; left: 0; top: 0; display: flex; align-items: center; gap: 4px; height: 20px; font-weight: 500; font-size: 16px; line-height: 16px; }
    .local-heading img { width: 20px; height: 20px; object-fit: contain; }
    .place-card { position: relative; left: 0; top: 0; width: 366px; min-height: 74px; height: auto; margin-top: 10px; padding: 16px; display: block; background: #FFFFFF; border-radius: 12px; }
    .place-card + .place-card { margin-top: 16px; }
    .place-name { position: relative; left: 0; top: 0; margin: 0; min-height: 16px; font-weight: 600; font-size: 16px; line-height: 18px; }
    .place-meta { position: relative; left: 0; top: 0; display: flex; gap: 28px; height: 14px; margin: 12px 0 0; font-weight: 500; font-size: 14px; line-height: 14px; }
    .checkin-panel { height: 266px; }
    .checkin-head { position: absolute; left: 16px; top: 18px; width: 366px; display: flex; justify-content: space-between; align-items: center; height: 16px; font-weight: 500; font-size: 16px; line-height: 16px; }
    .checkin-all { font-weight: 500; font-size: 16px; line-height: 16px; color: #949494; }
    .calendar-grid { position: absolute; left: 16px; top: 50px; display: grid; grid-template-columns: repeat(7, 42px); gap: 12px; }
    .calendar-day { width: 42px; height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: #FFFFFF; border: 1px solid #949494; border-radius: 8px; font-weight: 500; box-shadow: none; }
    .calendar-day span { font-size: 14px; line-height: 14px; color: #949494; }
    .calendar-day strong { font-size: 14px; line-height: 14px; font-weight: 600; }
    .calendar-day.is-today { background: #FFFFFF; border: 1px solid #100F0F; border-radius: 8px; }
    .calendar-day.is-done { background: var(--green); border-color: var(--ink); box-shadow: 2px 2px 0 var(--ink); }
    .calendar-day.is-done span { color: var(--ink); }
    .agenda-list { position: absolute; left: 16px; top: 120px; width: 366px; display: grid; gap: 12px; }
    .agenda-item { width: 366px; height: 62px; display: grid; grid-template-columns: 47px 1fr 24px; gap: 10px; align-items: start; padding: 12px 16px; background: #FFFFFF; border-radius: 12px; }
    .agenda-time { padding-top: 1px; font-weight: 500; font-size: 14px; line-height: 14px; color: #949494; }
    .agenda-item strong { display: block; height: 16px; font-weight: 600; font-size: 16px; line-height: 16px; }
    .agenda-item p { margin-top: 8px; width: 233px; overflow: hidden; text-overflow: ellipsis; font-weight: 500; font-size: 14px; line-height: 14px; color: #949494; white-space: nowrap; }
    .agenda-edit-button { width: 24px; height: 24px; margin-top: 7px; }
    .agenda-edit-icon { width: 24px; height: 24px; object-fit: contain; opacity: 0.75; }
    .checkin-add-button { position: absolute; left: 24px; top: 202px; width: 350px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--page); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 8px; font-weight: 500; font-size: 16px; line-height: 16px; transition: transform 120ms ease, box-shadow 120ms ease; }
    .record-overlay { position: fixed; left: 50%; top: 0; width: 430px; height: 932px; transform: translateX(-50%); z-index: 20; }
    .record-overlay[hidden] { display: none; }
    .record-mask { position: absolute; width: 430px; height: 932px; left: 0; top: 0; background: rgba(217, 217, 217, 0.6); }
    .record-sheet { position: absolute; left: 0; top: 171px; width: 430px; height: 761px; background: var(--page); border-radius: 16px 16px 0 0; }
    .record-title-label, .record-content-label { position: absolute; left: 16px; height: 16px; font-weight: 500; font-size: 16px; line-height: 16px; }
    .record-title-label { top: 24px; }
    .record-content-label { top: 108px; }
    .record-title-input, .record-text { position: absolute; left: 16px; width: 398px; padding: 0 16px; background: #FFFFFF; border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 12px; font-weight: 500; font-size: 14px; line-height: 14px; outline: none; }
    .record-title-input { top: 50px; height: 42px; }
    .record-text { top: 134px; height: 303px; padding-top: 14px; resize: none; line-height: 20px; }
    .record-title-input::placeholder, .record-text::placeholder { color: #949494; }
    .record-cancel-button, .record-confirm-button { position: absolute; top: 577px; width: 175px; height: 48px; display: flex; align-items: center; justify-content: center; border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 8px; font-weight: 500; font-size: 16px; line-height: 16px; transition: transform 120ms ease, box-shadow 120ms ease; }
    .record-cancel-button { left: 32px; background: var(--page); }
    .record-confirm-button { left: 223px; background: var(--yellow); }
    .add-button { position: absolute; width: 350px; height: 48px; left: calc(50% - 350px / 2); display: flex; align-items: center; justify-content: center; background: var(--yellow); border: var(--card-border); box-shadow: var(--card-shadow); border-radius: 8px; font-weight: 500; font-size: 16px; line-height: 16px; z-index: 2; transition: transform 120ms ease, box-shadow 120ms ease; }
    .action-tip { position: absolute; left: calc(50% - 78px / 2); width: 78px; height: 30px; display: flex; align-items: center; justify-content: center; background: rgba(16, 15, 15, 0.7); border: 1px solid rgba(16, 15, 15, 0.7); border-radius: 8px; text-align: center; font-weight: 400; font-size: 14px; line-height: 14px; color: #FFFFFF; z-index: 4; }
    .action-tip[hidden] { display: none; }
    .back-link:active, .section-toggle:active, .pill:active, .sort-pill:active, .resource-card:active, .gear-card:active, .place-card:active, .add-button:active, .status-select:active, .checkin-add-button:active, .record-confirm-button:active { transform: translate(2px, 2px); box-shadow: 0 0 0 #100F0F; }
    @media (max-width: 430px) { .detail-page { transform: scale(calc(100vw / 430)); } body { height: calc(var(--detail-height, 1534px) * (100vw / 430)); } }
  `;
  document.head.appendChild(style);

  const page = document.querySelector(".detail-page");
  const checkinPanel = document.querySelector(".checkin-panel");
  const agendaList = document.querySelector(".agenda-list");
  const checkinAddButton = document.querySelector(".checkin-add-button");
  const sectionMeta = {
    timeline: { title: ".timeline-title", toggle: ".timeline-toggle", panels: [".timeline-panel"], height: 301 },
    gear: { title: ".gear-title", toggle: ".gear-toggle", panels: [".gear-panel"], height: 252 },
    resource: { title: ".resource-title", toggle: ".resource-toggle", panels: [".resource-tabs", ".resource-cards"], height: 173, place: (top) => {
      document.querySelector(".resource-tabs").style.top = `${top}px`;
      document.querySelector(".resource-cards").style.top = `${top + 46}px`;
    } },
    local: { title: ".local-title", toggle: ".local-toggle", panels: [".sort-tabs", ".local-panel"], height: 188, place: (top) => {
      document.querySelector(".sort-tabs").style.top = `${top}px`;
      document.querySelector(".local-panel").style.top = `${top + 48}px`;
      const localPanel = document.querySelector(".local-panel");
      localPanel.style.height = "auto";
      sectionMeta.local.height = 48 + localPanel.offsetHeight;
    } },
    checkin: { title: ".checkin-title", toggle: ".checkin-toggle", panels: [".checkin-panel"], height: 266, onlyMine: true, postGap: 36 }
  };

  function syncCheckinHeight() {
    if (!checkinPanel || !agendaList || !checkinAddButton) return;
    const recordCount = agendaList.querySelectorAll(".agenda-item").length;
    const recordHeight = 62;
    const recordGap = 12;
    const listTop = 120;
    const buttonGap = 20;
    const buttonHeight = 48;
    const panelBottom = 16;
    const recordsHeight = (recordCount * recordHeight) + (Math.max(recordCount - 1, 0) * recordGap);
    const buttonTop = listTop + recordsHeight + buttonGap;
    const panelHeight = buttonTop + buttonHeight + panelBottom;
    checkinAddButton.style.top = `${buttonTop}px`;
    checkinPanel.style.height = `${panelHeight}px`;
    sectionMeta.checkin.height = panelHeight;
  }

  function truncateText(text, limit) {
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }

  function syncAgendaPreviews() {
    document.querySelectorAll(".agenda-item p").forEach((text) => {
      const fullText = text.dataset.fullText || text.textContent;
      text.dataset.fullText = fullText;
      text.textContent = truncateText(fullText, 16);
    });
  }

  function syncCheckinCount() {
    const countText = document.querySelector(".checkin-count");
    if (countText) countText.textContent = String(document.querySelectorAll(".calendar-day.is-done").length);
  }

  function placePanel(key, panelTop) {
    const meta = sectionMeta[key];
    if (meta.place) {
      meta.place(panelTop);
      return;
    }
    meta.panels.forEach((selector) => {
      document.querySelector(selector).style.top = `${panelTop}px`;
    });
  }

  function layout() {
    syncAgendaPreviews();
    syncCheckinCount();
    syncCheckinHeight();
    let top = 242;
    Object.keys(sectionMeta).forEach((key) => {
      const meta = sectionMeta[key];
      const title = document.querySelector(meta.title);
      const toggle = document.querySelector(meta.toggle);
      const isAvailable = !meta.onlyMine || (isMineMode && currentStatus === "ing");
      title.classList.toggle("is-collapsed", !isAvailable);
      toggle.classList.toggle("is-collapsed", !isAvailable);
      if (!isAvailable) {
        meta.panels.forEach((selector) => {
          document.querySelector(selector).classList.add("is-collapsed");
        });
        return;
      }
      const isOpen = openSections[key];
      title.style.top = `${top}px`;
      toggle.style.top = `${top}px`;
      toggle.querySelector("img").src = isOpen ? "assets/icon-arrow-up-s-line.svg" : "assets/icon-arrow-down-s-line.svg";
      meta.panels.forEach((selector) => {
        document.querySelector(selector).classList.toggle("is-collapsed", !isOpen);
      });
      if (isOpen) {
        const panelTop = top + 24;
        placePanel(key, panelTop);
        top = panelTop + meta.height + (meta.postGap || 16);
      } else {
        top += 30;
      }
    });
    const buttonTop = top;
    document.querySelector(".add-button").style.top = `${buttonTop}px`;
    document.querySelector(".action-tip").style.top = `${buttonTop - 36}px`;
    page.style.setProperty("--detail-height", `${buttonTop + 90}px`);
  }

  document.querySelectorAll(".section-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.section;
      openSections[key] = !openSections[key];
      layout();
    });
  });

  document.querySelectorAll(".resource-tabs .pill").forEach((button, index) => {
    button.addEventListener("click", () => {
      const group = ["video", "article", "creator"][index];
      document.querySelectorAll(".resource-tabs .pill").forEach((pill) => pill.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelector(".resource-cards").innerHTML = renderResources(group);
    });
  });

  document.querySelectorAll(".sort-tabs .sort-pill").forEach((button) => {
    button.dataset.sort = "asc";
    button.addEventListener("click", () => {
      const nextSort = button.dataset.sort === "asc" ? "desc" : "asc";
      button.dataset.sort = nextSort;
      button.querySelector("img").src = `assets/sort-${nextSort}.svg`;
      if (button.querySelector("span")?.textContent === "价格") {
        const localPanel = document.querySelector(".local-panel");
        const cards = [...localPanel.querySelectorAll(".place-card")];
        cards.sort((a, b) => {
          const priceA = Number(a.dataset.price || 0);
          const priceB = Number(b.dataset.price || 0);
          return nextSort === "asc" ? priceA - priceB : priceB - priceA;
        });
        cards.forEach((card) => localPanel.appendChild(card));
        layout();
      }
    });
  });

  const initialLocalPanel = document.querySelector(".local-panel");
  if (initialLocalPanel) {
    const initialCards = [...initialLocalPanel.querySelectorAll(".place-card")];
    initialCards.sort((a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0));
    initialCards.forEach((card) => initialLocalPanel.appendChild(card));
    layout();
  }

  const statusSelect = document.querySelector(".status-select");
  const statusMenu = document.querySelector(".status-menu");
  if (statusSelect && statusMenu) {
    function positionStatusMenu() {
      statusMenu.style.left = `${statusSelect.offsetLeft}px`;
      statusMenu.style.top = `${statusSelect.offsetTop + statusSelect.offsetHeight + 4}px`;
    }

    function renderStatus() {
      const status = statusMap[currentStatus];
      statusSelect.className = `status-select ${status.className}`;
      statusSelect.querySelector("span").textContent = status.text;
      openSections.checkin = currentStatus === "ing";
      saveCurrentStatus();
      layout();
      positionStatusMenu();
    }

    statusSelect.addEventListener("click", () => {
      const isOpen = statusMenu.hidden;
      statusMenu.hidden = !isOpen;
      statusSelect.setAttribute("aria-expanded", String(isOpen));
      statusSelect.querySelector("img").src = isOpen ? "assets/icon-arrow-up-s-line.svg" : "assets/icon-arrow-down-s-line.svg";
      positionStatusMenu();
    });

    statusMenu.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        currentStatus = button.dataset.status;
        renderStatus();
        statusMenu.hidden = true;
        statusSelect.setAttribute("aria-expanded", "false");
        statusSelect.querySelector("img").src = "assets/icon-arrow-down-s-line.svg";
      });
    });

    renderStatus();
  }

  layout();

  const addButton = document.querySelector(".add-button");
  const actionTip = document.querySelector(".action-tip");
  const recordOverlay = document.querySelector(".record-overlay");
  const recordTitleInput = document.querySelector(".record-title-input");
  const recordText = document.querySelector(".record-text");
  const recordConfirmButton = document.querySelector(".record-confirm-button");
  const recordCancelButton = document.querySelector(".record-cancel-button");
  let editingAgendaItem = null;
  const checkinDaysKey = `interestCalendarDays:${data.name}`;
  const recordsKey = `interestCheckinRecords:${data.name}`;

  function readSavedList() {
    return JSON.parse(localStorage.getItem("interestSavedList") || "[]");
  }

  function writeSavedList(list) {
    localStorage.setItem("interestSavedList", JSON.stringify(list));
  }

  function readDeletedNames() {
    return JSON.parse(localStorage.getItem("interestDeletedNames") || "[]");
  }

  function writeDeletedNames(names) {
    localStorage.setItem("interestDeletedNames", JSON.stringify(names));
  }

  function readSharedJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch (error) {
      // Cookie fallback keeps the prototype working in restricted preview contexts.
    }
    const cookieKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${cookieKey}=`));
    if (!cookie) return fallback;
    try {
      return JSON.parse(cookie.split("=").slice(1).join("="));
    } catch (error) {
      return fallback;
    }
  }

  function writeSharedJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Keep going with the cookie fallback below.
    }
    const cookieKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    document.cookie = `${cookieKey}=${JSON.stringify(value)}; path=/; max-age=31536000`;
  }

  function readCheckinDays() {
    return readSharedJSON(checkinDaysKey, []);
  }

  function writeCheckinDays(days) {
    writeSharedJSON(checkinDaysKey, days);
  }

  function readRecords() {
    return readSharedJSON(recordsKey, []);
  }

  function writeRecords(records) {
    writeSharedJSON(recordsKey, records);
  }

  function showActionTip(message, anchor) {
    actionTip.textContent = message;
    actionTip.hidden = false;
    if (anchor) {
      const pageRect = page.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const scale = pageRect.width / 430 || 1;
      const top = ((anchorRect.top - pageRect.top) / scale) - 90;
      actionTip.style.left = "calc(50% - 78px / 2)";
      actionTip.style.top = `${Math.max(16, top)}px`;
    } else {
      actionTip.style.left = "calc(50% - 78px / 2)";
      actionTip.style.top = `${parseFloat(addButton.style.top || "0") - 36}px`;
    }
    window.clearTimeout(showActionTip.timer);
    showActionTip.timer = window.setTimeout(() => {
      actionTip.hidden = true;
    }, 1000);
  }

  function saveCurrentStatus() {
    if (!isMineMode) return;
    const saved = readSavedList();
    const existing = saved.find((item) => item.name === data.name);
    if (existing) {
      existing.status = currentStatus;
    } else {
      saved.push({ name: data.name, status: currentStatus, addedAt: Date.now() });
    }
    writeSavedList(saved);
  }

  function createAgendaItem(title, text) {
    const item = document.createElement("article");
    item.className = "agenda-item";
    item.innerHTML = `
      <span class="agenda-time">刚刚</span>
      <div>
        <strong></strong>
        <p></p>
      </div>
      <button class="agenda-edit-button" type="button" aria-label="编辑记录">
        <img class="agenda-edit-icon" src="assets/icon-edit-2-line.svg" alt="" aria-hidden="true">
      </button>`;
    item.querySelector("strong").textContent = title;
    item.querySelector("p").dataset.fullText = text;
    item.querySelector("p").textContent = truncateText(text, 16);
    return item;
  }

  function readAgendaRecords() {
    if (!agendaList) return [];
    return Array.from(agendaList.querySelectorAll(".agenda-item")).map((item) => ({
      time: item.querySelector(".agenda-time")?.textContent || "刚刚",
      title: item.querySelector("strong")?.textContent || `${data.name}练习`,
      text: item.querySelector("p")?.dataset.fullText || item.querySelector("p")?.textContent || ""
    }));
  }

  function syncRecordsStorage() {
    const records = readAgendaRecords();
    if (records.length) writeRecords(records);
  }

  function hydrateRecords() {
    if (!agendaList) return;
    const records = readRecords();
    if (!records.length) return;
    agendaList.innerHTML = "";
    records.forEach((record) => {
      const item = createAgendaItem(record.title, record.text);
      item.querySelector(".agenda-time").textContent = record.time || "刚刚";
      agendaList.appendChild(item);
    });
  }

  function getTodayISO() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  function hydrateCheckinDays() {
    const days = readCheckinDays();
    const todayISO = getTodayISO();
    document.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.toggle("is-today", day.dataset.date === todayISO);
      day.classList.toggle("is-done", days.includes(day.dataset.date));
    });
    syncCheckinCount();
  }

  function refreshCheckinState() {
    hydrateRecords();
    hydrateCheckinDays();
    layout();
  }

  function openRecordSheet(item) {
    editingAgendaItem = item;
    const title = item?.querySelector("strong")?.textContent || "";
    const textNode = item?.querySelector("p");
    const text = textNode?.dataset.fullText || textNode?.textContent || "";
    recordTitleInput.value = title;
    recordText.value = text;
    recordOverlay.hidden = false;
    recordText.focus();
  }

  function closeRecordSheet() {
    recordOverlay.hidden = true;
    editingAgendaItem = null;
  }

  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.addEventListener("click", () => {
      day.classList.add("is-done");
      const days = readCheckinDays();
      if (!days.includes(day.dataset.date)) {
        days.push(day.dataset.date);
        writeCheckinDays(days);
      }
      syncCheckinCount();
      showActionTip("打卡成功", day);
    });
  });

  if (agendaList) {
    agendaList.addEventListener("click", (event) => {
      const editButton = event.target.closest(".agenda-edit-button");
      if (!editButton) return;
      openRecordSheet(editButton.closest(".agenda-item"));
    });
  }

  if (checkinAddButton) {
    checkinAddButton.addEventListener("click", () => {
      openRecordSheet(null);
    });
  }

  if (recordConfirmButton) {
    recordConfirmButton.addEventListener("click", () => {
      const title = recordTitleInput.value.trim() || `${data.name}练习`;
      const text = recordText.value.trim() || "记录一下今天的小进展";
      if (editingAgendaItem) {
        editingAgendaItem.querySelector("strong").textContent = title;
        editingAgendaItem.querySelector("p").dataset.fullText = text;
        editingAgendaItem.querySelector("p").textContent = truncateText(text, 16);
      } else if (agendaList) {
        agendaList.appendChild(createAgendaItem(title, text));
      }
      syncRecordsStorage();
      closeRecordSheet();
      layout();
    });
  }

  if (recordCancelButton) {
    recordCancelButton.addEventListener("click", closeRecordSheet);
  }

  addButton.addEventListener("click", () => {
    if (isMineMode) {
      const saved = readSavedList().filter((item) => item.name !== data.name);
      const deleted = readDeletedNames();
      if (!deleted.includes(data.name)) deleted.push(data.name);
      writeSavedList(saved);
      writeDeletedNames(deleted);
      showActionTip("删除成功");
      return;
    }

    const saved = readSavedList();
    const existing = saved.find((item) => item.name === data.name);
    if (existing) {
      existing.status = "try";
    } else {
      saved.push({ name: data.name, status: "try", addedAt: Date.now() });
    }
    writeSavedList(saved);
    writeDeletedNames(readDeletedNames().filter((name) => name !== data.name));
    showActionTip("添加成功");
  });

  window.addEventListener("pageshow", refreshCheckinState);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshCheckinState();
  });

  refreshCheckinState();
})();
