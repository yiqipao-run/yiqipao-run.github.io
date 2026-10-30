const sourceItems = Array.isArray(window.YIQIPAO_ARTICLES) ? window.YIQIPAO_ARTICLES : [];
const itemFixes = {
  "https://mp.weixin.qq.com/s/v7-6_RwLs2kG3cSxyRvabw": { date: "2026-05-24", category: "一起跑周报" },
  "https://mp.weixin.qq.com/s/PeNdRHX7CDJ63QdN-XvnMA": { date: "2026-03-31", category: "训练营" },
  "https://mp.weixin.qq.com/s/_C-_qGyNDtaHcrPNLoNM5A": { date: "2025-12-10", category: "训练营" },
  "https://mp.weixin.qq.com/s/yBQ2CThhtf-3GtH7Gwfj-A": { date: "2025-10-05", category: "一起跑周报" },
  "https://mp.weixin.qq.com/s/nqlDbk2mjkhiEgGvbPjLHg": { date: "2025-09-29", category: "一起跑周报" },
  "https://mp.weixin.qq.com/s/N4XYfiR2y2aOKdKzqLKFsA": { date: "2025-09-28", category: "一起跑周报" },
  "https://mp.weixin.qq.com/s/kY3ZZ082xENP6O7A7I5qeA": { date: "2024-02-19", category: "其他" },
  "https://mp.weixin.qq.com/s/8eDuH3YeN0NZA908JCQ0ew": { date: "2024-01-15", category: "其他" },
  "https://mp.weixin.qq.com/s/t50Z039W0eAihboa8BlWIg": { date: "2024-01-10", category: "其他" },
  "https://mp.weixin.qq.com/s/RJZ22zLwpDMAg427iX2wzA": { category: "训练营" },
  "https://mp.weixin.qq.com/s/OZNicbZ9kVmN_Bye4dJ14A": { category: "其他" },
  "https://mp.weixin.qq.com/s/0fEXh24TbRkpxT_5LZKfIA": { category: "其他" },
  "https://mp.weixin.qq.com/s/TjuElJ1KvlH-yAXRNBckuQ": { category: "其他" },
  "https://mp.weixin.qq.com/s/FadQtITui-GyGHvon-cBpw": { category: "其他" },
  "https://mp.weixin.qq.com/s/Qvagbw8VFMp0N_Ry3PRhxg": { category: "其他" },
};
const personDates = new Set([
  "2024-09-24",
  "2017-09-22",
  "2016-05-24", "2016-05-27",
  "2016-10-20", "2016-10-21",
  "2016-11-24", "2016-11-25", "2016-11-28", "2016-11-29", "2016-11-30",
  "2016-12-01", "2016-12-02", "2016-12-03", "2016-12-04", "2016-12-05",
  "2016-12-06", "2016-12-07", "2016-12-08", "2016-12-09", "2016-12-13",
]);
const items = sourceItems.map((item) => {
  const fixedItem = { ...item, ...(itemFixes[item.url] || {}) };
  const category = personDates.has(fixedItem.date) || fixedItem.category === "人物对话"
    ? "人物"
    : fixedItem.category;
  return { ...fixedItem, category };
});
const categories = ["全部", "一起跑周报", "年度接力赛", "人物", "训练营", "其他"];
const fallbackImages = {
  "一起跑周报": "assets/weekly.png",
  "年度接力赛": "assets/relay.png",
  "人物": "assets/interview.jpeg",
  "训练营": "assets/training.png",
  "其他": "assets/relay.png",
};

let activeCategory = "全部";
let activeDate = "";
let query = "";
let currentPage = 1;
const pageSize = 4;

const filters = document.querySelector(".filters");
const list = document.querySelector("#content-list");
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const dateList = document.querySelector("#date-list");
const clearDate = document.querySelector("#clear-date");
const pager = document.querySelector("#pager");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  if (!date) return "日期待补";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    .format(new Date(`${date}T00:00:00`));
}

function renderFilters() {
  filters.innerHTML = categories.map((category) => `
    <button type="button" class="filter-button ${category === activeCategory ? "active" : ""}" data-category="${category}">${category}</button>
  `).join("");
}

function filteredItems() {
  const normalizedQuery = query.toLowerCase();
  return items.filter((item) => {
    const matchesCategory = activeCategory === "全部" || item.category === activeCategory;
    const matchesDate = !activeDate || (activeDate === "unknown" ? !item.date : item.date.startsWith(activeDate));
    const haystack = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
    return matchesCategory && matchesDate && haystack.includes(normalizedQuery);
  });
}

function renderItems() {
  const results = filteredItems();
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  currentPage = Math.min(currentPage, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageItems = results.slice(start, start + pageSize);
  const dateLabel = activeDate === "unknown" ? "日期待补" : activeDate ? activeDate.replace("-", " 年 ") + " 月" : "全部内容";

  count.textContent = `${dateLabel} · 共 ${results.length} 篇${results.length ? ` · 第 ${currentPage}/${pageCount} 页` : ""}`;
  empty.hidden = results.length > 0;

  list.innerHTML = pageItems.map((item) => {
    const fallback = fallbackImages[item.category] || fallbackImages.其他;
    const image = item.image || fallback;
    return `
      <article class="content-card">
        <img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallback)}" alt="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" />
        <div>
          <div class="card-topline"><span class="pill">${escapeHtml(item.category)}</span><span>${formatDate(item.date)}</span></div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <a class="card-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">阅读公众号原文 <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }).join("");

  list.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      if (image.src.endsWith(image.dataset.fallback)) return;
      image.src = image.dataset.fallback;
    }, { once: true });
  });

  pager.hidden = results.length <= pageSize;
  pager.innerHTML = results.length > pageSize ? `
    <button type="button" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>上一页</button>
    <span>${currentPage} / ${pageCount}</span>
    <button type="button" data-page="next" ${currentPage === pageCount ? "disabled" : ""}>下一页</button>
  ` : "";
}

function renderDates() {
  const months = new Map();
  let missingDates = 0;

  items.forEach((item) => {
    if (!item.date) {
      missingDates += 1;
      return;
    }
    const month = item.date.slice(0, 7);
    months.set(month, (months.get(month) || 0) + 1);
  });

  const years = [...new Set([...months.keys()].map((month) => month.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  dateList.innerHTML = years.map((year) => {
    const yearMonths = [...months.entries()]
      .filter(([month]) => month.startsWith(year))
      .sort(([left], [right]) => right.localeCompare(left));
    return `
      <div class="date-year">
        <strong>${year}</strong>
        <div class="date-months">
          ${yearMonths.map(([value, total]) => `
            <button type="button" class="date-button ${activeDate === value ? "active" : ""}" data-date="${value}">
              <span>${Number(value.slice(5))}月</span><small>${total}</small>
            </button>
          `).join("")}
        </div>
      </div>`;
  }).join("") + (missingDates ? `
    <button type="button" class="date-button unknown-date ${activeDate === "unknown" ? "active" : ""}" data-date="unknown">
      <span>日期待补</span><small>${missingDates}</small>
    </button>
  ` : "");
  clearDate.hidden = !activeDate;
}

function refresh() {
  renderFilters();
  renderDates();
  renderItems();
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  currentPage = 1;
  refresh();
});

dateList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  activeDate = activeDate === button.dataset.date ? "" : button.dataset.date;
  currentPage = 1;
  refresh();
});

clearDate.addEventListener("click", () => {
  activeDate = "";
  currentPage = 1;
  refresh();
});

document.querySelector("#search").addEventListener("input", (event) => {
  query = event.target.value.trim();
  currentPage = 1;
  renderItems();
});

pager.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;
  currentPage += button.dataset.page === "next" ? 1 : -1;
  renderItems();
  document.querySelector("#archive").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-filter-link]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filterLink;
    activeDate = "";
    query = "";
    currentPage = 1;
    document.querySelector("#search").value = "";
    refresh();
    document.querySelector("#archive").scrollIntoView({ behavior: "smooth" });
  });
});

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
});

refresh();
