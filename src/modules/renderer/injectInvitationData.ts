import type { InvitationData, EventItem } from "@/types/winvit"
import { getWishesBySlugApi, createWishApi } from "@/lib/api"

export function formatIndonesianDateParts(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return null

  const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    d
  )
  const dayNum = String(d.getDate()).padStart(2, "0")
  const dayNumShort = String(d.getDate())
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    d
  )
  const monthNum = String(d.getMonth() + 1).padStart(2, "0")
  const yearNum = String(d.getFullYear())

  return {
    dayName,
    dayNum,
    dayNumShort,
    monthName,
    monthNum,
    yearNum,
    dotDate: `${dayNum}.${monthNum}.${yearNum}`,
    spacedDotDate: `${dayNum} · ${monthNum} · ${yearNum}`,
    fullDateComma: `${dayName}, ${dayNumShort} ${monthName} ${yearNum}`,
    fullDateDot: `${dayName} · ${dayNumShort} ${monthName} ${yearNum}`,
    monthYear: `${monthName} ${yearNum}`,
  }
}

export function injectInvitationIntoIframe(
  iframe: HTMLIFrameElement,
  invitation: InvitationData,
  activeSlug: string,
  onWishesLoaded?: (list: any[]) => void
) {
  const doc = iframe.contentDocument
  const win = iframe.contentWindow as any
  if (!doc || !doc.body) return

  // Hide native scrollbars inside preview iframe across all browsers
  if (!doc.getElementById("wv-hide-scrollbar")) {
    const styleEl = doc.createElement("style")
    styleEl.id = "wv-hide-scrollbar"
    styleEl.textContent = `
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `
    doc.head?.appendChild(styleEl)
  }

  const brideFull = invitation.couple.bride.fullName.trim()
  const groomFull = invitation.couple.groom.fullName.trim()
  const brideShort =
    invitation.couple.bride.nickname.trim() || brideFull.split(" ")[0] || ""
  const groomShort =
    invitation.couple.groom.nickname.trim() || groomFull.split(" ")[0] || ""

  const displayBrideFull = brideFull || "Unnamed (Mempelai Wanita)"
  const displayGroomFull = groomFull || "Unnamed (Mempelai Pria)"
  const displayBrideShort = brideShort || "Unnamed"
  const displayGroomShort = groomShort || "Unnamed"

  const coupleShort =
    groomShort && brideShort
      ? `${groomShort} & ${brideShort}`
      : groomShort || brideShort
        ? `${groomShort || "Unnamed"} & ${brideShort || "Unnamed"}`
        : "Unnamed & Unnamed"

  const gInit = (groomShort[0] || "U").toUpperCase()
  const bInit = (brideShort[0] || "U").toUpperCase()
  const monogramText = `${gInit}&${bInit}`

  const brideInfoText =
    invitation.couple.bride.info?.trim() ||
    (invitation.couple.bride.fatherName.trim() ||
    invitation.couple.bride.motherName.trim()
      ? `Putri dari ${invitation.couple.bride.fatherName} & ${invitation.couple.bride.motherName}`
      : "Info orang tua mempelai wanita belum diisi")

  const groomInfoText =
    invitation.couple.groom.info?.trim() ||
    (invitation.couple.groom.fatherName.trim() ||
    invitation.couple.groom.motherName.trim()
      ? `Putra dari ${invitation.couple.groom.fatherName} & ${invitation.couple.groom.motherName}`
      : "Info orang tua mempelai pria belum diisi")

  // =========================================================================
  // 1. COUPLE NAMES, MONOGRAMS & SPLIT TEXT ACROSS ALL 20 THEMES
  // =========================================================================
  doc.title = `The Wedding of ${coupleShort}`
  if (win?.CONFIG) {
    win.CONFIG.couple = coupleShort
  }

  // Standard name containers across all themes
  doc
    .querySelectorAll(
      ".cover-names, .cover-title, .c-names, .names, .letter b, .footer-names, footer .chip, [data-wv='meta.title']"
    )
    .forEach((el) => {
      if (el.querySelector("span") && el.classList.contains("cover-title")) {
        el.innerHTML = `${displayGroomShort}<span>&amp;</span>${displayBrideShort}`
      } else if (el.querySelector("i") || el.querySelector("em")) {
        const tag = el.querySelector("i") ? "i" : "em"
        el.innerHTML = `${displayGroomShort} <${tag}>&amp;</${tag}> ${displayBrideShort}`
      } else {
        el.textContent = coupleShort
      }
    })

  // Footer eyebrow couple name (black-diamond, midnight-celestial, obsidian-smoke, golden-regeria)
  doc.querySelectorAll("footer .eyebrow").forEach((el) => {
    const txt = (el.textContent || "").toLowerCase()
    if (txt.includes("unnamed") || txt.includes("&")) {
      el.textContent = coupleShort
    }
  })

  // Obsidian-smoke [data-split] animated character spans
  doc.querySelectorAll(".nm[data-split], [data-split]").forEach((el) => {
    el.textContent = coupleShort
  })

  // Hero names (.hero-names, .hero-name, header h1, #cover h1)
  doc.querySelectorAll(".hero-names").forEach((hn) => {
    const ems = hn.querySelectorAll("em")
    const spanA = hn.querySelector(".a")
    const spanB = hn.querySelector(".b")
    if (ems.length >= 2) {
      ems[0].textContent = displayGroomShort
      ems[1].textContent = displayBrideShort
    } else if (spanA && spanB) {
      spanA.textContent = displayGroomShort
      spanB.textContent = displayBrideShort
    } else {
      hn.textContent = coupleShort
    }
  })

  const heroNameSpans = doc.querySelectorAll(".hero-name")
  if (heroNameSpans.length >= 2) {
    heroNameSpans[0].textContent = displayGroomShort
    heroNameSpans[1].textContent = displayBrideShort
  }

  // Themes using <h1> inside #cover or .hero (batik, golden-hour, kraton, tideline-bento)
  doc.querySelectorAll("#cover h1, header.hero h1, .hero h1").forEach((h1) => {
    if (h1.classList.contains("hero-names")) return
    if (h1.querySelectorAll(".hero-name").length >= 2) return
    const innerSpan = h1.querySelector("span, em")
    const innerItalic = h1.querySelector("i")
    if (innerItalic) {
      h1.innerHTML = `${displayGroomShort} <i>&amp;</i><br>${displayBrideShort}`
    } else if (innerSpan) {
      h1.innerHTML = `${displayGroomShort}<span>&amp; ${displayBrideShort}</span>`
    } else {
      h1.textContent = coupleShort
    }
  })

  // Golden-hour vertical text & Botanica marquee
  doc.querySelectorAll(".vert").forEach((el) => {
    el.textContent = `THE WEDDING OF ${coupleShort.toUpperCase()}`
  })

  const marqueeEl = doc.getElementById("marquee")
  if (marqueeEl) {
    const item = `<span>${coupleShort}</span><span class="dot">✦</span>`
    marqueeEl.innerHTML = item.repeat(8)
  }

  // Monograms (seal, cover-monogram, mono foil, dome-in, SVG data-wreath)
  doc
    .querySelectorAll(
      ".seal span, .mono .foil, .cover-monogram span, .dome-in span"
    )
    .forEach((el) => {
      el.textContent = monogramText
    })

  doc.querySelectorAll("[data-wreath]").forEach((svg) => {
    const tspans = svg.querySelectorAll("tspan")
    if (tspans.length >= 3) {
      tspans[0].textContent = gInit
      tspans[2].textContent = bInit
    }
    svg.setAttribute("aria-label", `Monogram ${gInit} & ${bInit}`)
  })

  // =========================================================================
  // 2. COUPLE CARDS (#mempelai) — NAMES, PARENTS INFO & PHOTOS
  // =========================================================================
  let brideCard: Element | null = null
  let groomCard: Element | null = null

  const personCards = doc.querySelectorAll(
    "#mempelai .person, #mempelai .cp, #mempelai .half, .mempelai-section .col-md-4, .couple > article, .couple > .person"
  )
  if (personCards.length >= 2) {
    brideCard = personCards[0]
    groomCard = personCards[1]
  } else {
    // Fallback for tideline-bento or other grid layouts using crop1/crop2
    const crop1Img = doc.querySelector('img[src*="crop1.jpeg"]')
    const crop2Img = doc.querySelector('img[src*="crop2.jpeg"]')
    brideCard = crop1Img?.closest(".tile, article, .person, .col-md-4") || null
    groomCard = crop2Img?.closest(".tile, article, .person, .col-md-4") || null
  }

  const applyPersonCard = (
    card: Element | null,
    shortName: string,
    fullName: string,
    infoText: string,
    photoUrl: string,
    initialChar: string
  ) => {
    if (!card) return
    const nickEl = card.querySelector(".nick")
    const fullEl = card.querySelector(".full")
    const h3El = card.querySelector("h3, .person-name, .couple-name")
    const sealEl = card.querySelector(".seal")

    if (nickEl) nickEl.textContent = shortName
    if (sealEl) sealEl.textContent = initialChar
    if (fullEl) {
      fullEl.textContent = fullName
      if (h3El) h3El.textContent = shortName
    } else if (h3El) {
      h3El.textContent = fullName
    }

    const pEl = card.querySelector("p")
    if (pEl) {
      pEl.textContent = infoText
    }

    if (photoUrl) {
      const imgEl = card.querySelector<HTMLImageElement>("img")
      if (imgEl) imgEl.src = photoUrl
      const htmlCard = card as HTMLElement
      if (htmlCard.style.getPropertyValue("--bg")) {
        htmlCard.style.setProperty("--bg", `url('${photoUrl}')`)
      }
    }
  }

  applyPersonCard(
    brideCard,
    displayBrideShort,
    displayBrideFull,
    brideInfoText,
    invitation.couple.bride.photo,
    bInit
  )
  applyPersonCard(
    groomCard,
    displayGroomShort,
    displayGroomFull,
    groomInfoText,
    invitation.couple.groom.photo,
    gInit
  )

  if (invitation.couple.bride.photo) {
    doc
      .querySelectorAll<HTMLImageElement>('img[src*="crop1.jpeg"]')
      .forEach((img) => {
        img.src = invitation.couple.bride.photo
      })
  }
  if (invitation.couple.groom.photo) {
    doc
      .querySelectorAll<HTMLImageElement>('img[src*="crop2.jpeg"]')
      .forEach((img) => {
        img.src = invitation.couple.groom.photo
      })
  }

  // Footer family info
  doc.querySelectorAll(".footer-family").forEach((famBox) => {
    const p = famBox.querySelector("p")
    const combined = [brideInfoText, groomInfoText].filter(Boolean)
    if (combined.length === 0) {
      ;(famBox as HTMLElement).style.display = "none"
    } else {
      ;(famBox as HTMLElement).style.display = ""
      if (p) p.innerHTML = combined.join("<br>serta<br>")
    }
  })

  // =========================================================================
  // 3. COVER PHOTO & BACKSOUND MUSIC
  // =========================================================================
  if (
    invitation.meta.coverPhoto &&
    invitation.meta.coverPhoto !== "placeholder.png"
  ) {
    const coverUrl = invitation.meta.coverPhoto
    doc
      .querySelectorAll<HTMLImageElement>(
        "#cover img, .hero img, .hero-visual img, .hero-tampah img, .hero-photo img, footer .footer-photo img"
      )
      .forEach((img) => {
        img.src = coverUrl
      })
    doc
      .querySelectorAll<HTMLElement>(
        "#cover, #cover .bgp, header.hero, .hero .bgp"
      )
      .forEach((el) => {
        if (el.style.getPropertyValue("--bg")) {
          el.style.setProperty("--bg", `url('${coverUrl}')`)
        }
        if (el.style.getPropertyValue("--bgi")) {
          el.style.setProperty("--bgi", `url('${coverUrl}')`)
        }
      })
  }

  if (invitation.meta.audio.url) {
    const audioEl = doc.getElementById("myAudio") as HTMLAudioElement | null
    if (audioEl) audioEl.src = invitation.meta.audio.url
    if (win?.CONFIG) win.CONFIG.audioStart = 0
  }

  // =========================================================================
  // 4. EVENTS (#acara), DATES, ADDRESS, GOOGLE MAPS, CALENDAR & COUNTDOWN
  // =========================================================================
  const rawEvents: EventItem[] =
    invitation.eventList && invitation.eventList.length > 0
      ? invitation.eventList
      : [
          {
            name: invitation.events.akad.title || "Akad Nikah",
            date: invitation.events.akad.date,
            startTime: invitation.events.akad.startTime,
            endTime: invitation.events.akad.endTime,
            locationName: invitation.events.akad.locationName || "",
            locationAddress: invitation.events.akad.address,
            locationUrl: invitation.events.akad.mapsUrl,
            sortOrder: 1,
          },
          {
            name: invitation.events.resepsi.title || "Resepsi",
            date: invitation.events.resepsi.date,
            startTime: invitation.events.resepsi.startTime,
            endTime: invitation.events.resepsi.endTime,
            locationName: invitation.events.resepsi.locationName || "",
            locationAddress: invitation.events.resepsi.address,
            locationUrl: invitation.events.resepsi.mapsUrl,
            sortOrder: 2,
          },
        ]

  const filledEvents = rawEvents.filter(
    (ev) =>
      ev.date ||
      ev.locationName.trim() ||
      ev.locationAddress.trim() ||
      ev.name.trim()
  )
  const primaryEvent =
    filledEvents.find((ev) => ev.date || ev.locationAddress.trim()) ||
    filledEvents[0]
  const dateParts = formatIndonesianDateParts(primaryEvent?.date)

  // Always update or clear hardcoded "14 / Minggu / Juni 2026" date widgets
  const setDateWidgetText = (selector: string, text: string) => {
    doc.querySelectorAll(selector).forEach((el) => {
      el.textContent = text
    })
  }

  setDateWidgetText(
    ".date-big, .stub-date, .bigday, .bigd b, .big-date b, .plaque b, .sun b, .acara-side .big-date, .hero-date strong, .stadium .badge b, #acara .big",
    dateParts ? dateParts.dayNum : "--"
  )

  doc
    .querySelectorAll(".bigd, .big-date, .plaque, .sun, #acara .date")
    .forEach((box) => {
      const smalls = box.querySelectorAll("small, span")
      if (smalls.length >= 2) {
        smalls[0].textContent = dateParts ? dateParts.dayName : "Tanggal"
        smalls[1].textContent = dateParts ? dateParts.monthYear : "Segera Hadir"
      }
    })

  setDateWidgetText(
    ".date-meta, #acara .mo",
    dateParts ? `${dateParts.dayName} · ${dateParts.monthYear}` : ""
  )
  setDateWidgetText(
    ".hero .date, .hero .chip, #acara .section-head .sub, .acara-bg .section-sub",
    dateParts ? dateParts.fullDateComma : ""
  )
  setDateWidgetText(
    ".hero-date b",
    dateParts ? dateParts.dotDate : "--.--.----"
  )
  const heroDateFirstSpan = doc.querySelector(".hero-date > span:first-child")
  if (heroDateFirstSpan && !heroDateFirstSpan.classList.contains("sep")) {
    heroDateFirstSpan.textContent = dateParts ? dateParts.dayName : ""
  }
  doc.querySelectorAll(".stadium .badge span").forEach((el) => {
    el.textContent = dateParts ? dateParts.monthYear : ""
  })
  doc.querySelectorAll(".acara-side .m").forEach((el) => {
    el.innerHTML = dateParts
      ? `${dateParts.dayName},<br>${dateParts.monthName} <i>${dateParts.yearNum}</i>`
      : ""
  })
  setDateWidgetText(
    ".footer-date, .letter small:last-child",
    dateParts ? dateParts.spacedDotDate : ""
  )
  setDateWidgetText(
    ".footer-sign",
    dateParts
      ? `${coupleShort.toUpperCase()} · ${dateParts.spacedDotDate}`
      : coupleShort.toUpperCase()
  )
  doc.querySelectorAll("textPath").forEach((tp) => {
    tp.textContent = dateParts
      ? `save the date • ${dateParts.dotDate} •`
      : `save the date • ${coupleShort} •`
  })

  // Update Hero pills (golden-hour)
  const heroPills = doc.querySelectorAll(".hero .pill")
  if (heroPills.length >= 1) {
    heroPills[0].textContent = dateParts ? dateParts.fullDateComma : ""
  }
  if (heroPills.length >= 2) {
    heroPills[1].textContent =
      primaryEvent?.locationName || primaryEvent?.locationAddress || ""
  }
  // Update Hero top location (ungu-senja)
  const heroTopSpans = doc.querySelectorAll(".hero-top span")
  if (heroTopSpans.length >= 2) {
    heroTopSpans[1].textContent =
      primaryEvent?.locationName || primaryEvent?.locationAddress || ""
  }

  // Update Address across ALL 20 themes
  const fullLocation = [
    primaryEvent?.locationName?.trim(),
    primaryEvent?.locationAddress?.trim(),
  ]
    .filter(Boolean)
    .join(" — ")

  const addrParagraphs = new Set<Element>()
  doc
    .querySelectorAll(
      ".addr p, .date-loc p, .venue p, .acara-card p, .loc p, .address p"
    )
    .forEach((p) => addrParagraphs.add(p))

  // Also catch any <p> inside #acara that has the neutral address placeholder
  doc.querySelectorAll("#acara p, .acara-bg p").forEach((p) => {
    const txt = (p.textContent || "").toLowerCase()
    if (txt.includes("lokasi acara belum diisi") || txt.includes("lokasi belum diisi")) {
      addrParagraphs.add(p)
    }
  })

  addrParagraphs.forEach((p) => {
    p.textContent = fullLocation || "Lokasi acara belum diisi"
  })

  // Update Maps URL
  const mapsUrl = primaryEvent?.locationUrl?.trim()
  doc
    .querySelectorAll<HTMLAnchorElement>(
      '#btn-maps, a[href*="maps.app.goo.gl"], a[href*="maps.google"]'
    )
    .forEach((a) => {
      if (mapsUrl) {
        a.href = mapsUrl
        a.style.display = ""
      } else {
        a.href = "#acara"
      }
    })

  // Update Event Items across ALL 20 themes
  const eventsToRender = filledEvents.length > 0 ? filledEvents : []
  const eventCardSelectors = [
    "#acara .event-item",
    "#acara .event-card",
    "#acara .ev2 > div",
    "#acara .ev3 > .ec",
    "#acara .ev > .ec",
    "#acara .tl > div",
    "#acara .ticket-row > div",
  ]
  for (const sel of eventCardSelectors) {
    const cards = doc.querySelectorAll(sel)
    if (cards.length > 0) {
      const parent = cards[0].parentElement
      if (!parent) break
      const templateCard = cards[0].cloneNode(true) as HTMLElement
      const actionsEl = parent.querySelector(".event-actions")

      // Remove old cards and divider <hr>
      cards.forEach((c) => c.remove())
      parent.querySelectorAll(":scope > hr").forEach((hr) => hr.remove())

      eventsToRender.forEach((ev, idx) => {
        if (idx > 0 && sel.includes(".ev2")) {
          parent.appendChild(doc.createElement("hr"))
        }
        const clone = templateCard.cloneNode(true) as HTMLElement
        const titleEl = clone.querySelector("h4, h3, strong, b")
        if (titleEl) titleEl.textContent = ev.name || `Acara ${idx + 1}`

        const timeText = ev.startTime
          ? `${ev.startTime} WIB${ev.endTime ? ` — ${ev.endTime} WIB` : " — Selesai"}`
          : "-"
        const timeEl = clone.querySelector(".t, .time, .event-time, span")
        if (timeEl) timeEl.textContent = timeText

        const evDateParts = formatIndonesianDateParts(ev.date)
        const dayEl = clone.querySelector(".event-day")
        if (dayEl) {
          dayEl.textContent = evDateParts ? evDateParts.fullDateDot : ""
        }

        if (actionsEl) {
          parent.insertBefore(clone, actionsEl)
        } else {
          parent.appendChild(clone)
        }
      })
      break
    }
  }

  // Update classic-rose combined .acara-card times
  const acaraTimes = doc.querySelectorAll(".acara-card .acara-time")
  if (acaraTimes.length > 0 && eventsToRender.length > 0) {
    const parent = acaraTimes[0].parentElement
    if (parent) {
      const tpl = acaraTimes[0].cloneNode(true) as HTMLElement
      acaraTimes.forEach((el) => el.remove())
      eventsToRender.forEach((ev) => {
        const clone = tpl.cloneNode(true) as HTMLElement
        clone.textContent = `${ev.name} · ${ev.startTime || ""}${
          ev.endTime ? ` — ${ev.endTime}` : ""
        }`
        parent.appendChild(clone)
      })
    }
  }

  // Clear ALL hardcoded June 14, 2026 countdown intervals and replace with real date
  if (win) {
    const sentinel = win.setInterval(() => {}, 999999)
    for (let id = 1; id <= sentinel; id++) {
      win.clearInterval(id)
    }

    const dEl = doc.getElementById("cd-days")
    const hEl = doc.getElementById("cd-hours")
    const mEl = doc.getElementById("cd-min")
    const sEl = doc.getElementById("cd-sec")

    if (primaryEvent?.date) {
      const startIso = `${primaryEvent.date}T${
        primaryEvent.startTime && primaryEvent.startTime.length >= 5
          ? primaryEvent.startTime.slice(0, 5)
          : "09:00"
      }:00+07:00`
      const endIso = `${primaryEvent.date}T${
        primaryEvent.endTime && primaryEvent.endTime.length >= 5
          ? primaryEvent.endTime.slice(0, 5)
          : "14:00"
      }:00+07:00`

      if (win.CONFIG) {
        win.CONFIG.eventStart = startIso
        win.CONFIG.eventEnd = endIso
        if (fullLocation) win.CONFIG.location = fullLocation
      }

      // Update Google Calendar anchor links
      const fmtCal = (iso: string) =>
        new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
      const calUrl =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" +
        encodeURIComponent(`Pernikahan ${coupleShort}`) +
        "&dates=" +
        `${fmtCal(startIso)}/${fmtCal(endIso)}` +
        "&location=" +
        encodeURIComponent(fullLocation || "")
      ;["btn-calendar", "btn-calendar-cd", "btn-calendar-hero"].forEach(
        (id) => {
          const a = doc.getElementById(id) as HTMLAnchorElement | null
          if (a) a.href = calUrl
        }
      )

      // Override saveCal (.ics download)
      win.saveCal = () => {
        const dtStart = primaryEvent.date.replace(/-/g, "") + "T080000"
        const dtEnd = primaryEvent.date.replace(/-/g, "") + "T140000"
        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Winvitaa//ID",
          "BEGIN:VEVENT",
          `UID:${activeSlug}@winvitaa`,
          `DTSTART;TZID=Asia/Jakarta:${dtStart}`,
          `DTEND;TZID=Asia/Jakarta:${dtEnd}`,
          `SUMMARY:Pernikahan ${coupleShort}`,
          `LOCATION:${fullLocation.replace(/,/g, "\\,")}`,
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n")
        const blobUrl = URL.createObjectURL(
          new Blob([ics], { type: "text/calendar" })
        )
        const a = doc.createElement("a")
        a.href = blobUrl
        a.download = `pernikahan-${activeSlug}.ics`
        doc.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(blobUrl)
        if (typeof win.showToast === "function") {
          win.showToast("Acara disimpan ke kalender")
        }
      }

      const targetMs = new Date(startIso).getTime()
      if (!isNaN(targetMs) && dEl && hEl && mEl && sEl) {
        const tickReal = () => {
          const diff = Math.max(0, targetMs - Date.now())
          const pad = (n: number) => String(n).padStart(2, "0")
          dEl.textContent = pad(Math.floor(diff / 86400000))
          hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000))
          mEl.textContent = pad(Math.floor((diff % 3600000) / 60000))
          sEl.textContent = pad(Math.floor((diff % 60000) / 1000))
        }
        tickReal()
        win.setInterval(tickReal, 1000)
      }
    } else if (dEl && hEl && mEl && sEl) {
      dEl.textContent = "00"
      hEl.textContent = "00"
      mEl.textContent = "00"
      sEl.textContent = "00"
    }
  }

  // =========================================================================
  // 5. LOVE STORY (#story / .timeline) — ALL 20 THEMES + HIDE WHEN EMPTY
  // =========================================================================
  const storySection = (doc.getElementById("story") ||
    doc.querySelector(".timeline")?.closest("section, .section-pad")) as
    | HTMLElement
    | null

  if (storySection) {
    if (!invitation.stories || invitation.stories.length === 0) {
      storySection.style.display = "none"
    } else {
      storySection.style.display = ""

      // Special case: golden-hour uses .steps buttons + .panel panels
      const stepsWrap = storySection.querySelector(".steps")
      const panels = storySection.querySelectorAll(".panel")
      if (stepsWrap && panels.length > 0) {
        const panelParent = panels[0].parentElement
        const panelTpl = panels[0].cloneNode(true) as HTMLElement
        stepsWrap.innerHTML = ""
        panels.forEach((p) => p.remove())

        invitation.stories.forEach((st, idx) => {
          const btn = doc.createElement("button")
          if (idx === 0) btn.className = "on"
          btn.textContent = st.title || `Bab ${idx + 1}`
          btn.onclick = () => {
            stepsWrap
              .querySelectorAll("button")
              .forEach((b, i) => b.classList.toggle("on", i === idx))
            panelParent
              ?.querySelectorAll(".panel")
              .forEach((p, i) => p.classList.toggle("on", i === idx))
          }
          stepsWrap.appendChild(btn)

          const clone = panelTpl.cloneNode(true) as HTMLElement
          clone.classList.toggle("on", idx === 0)
          const nEl = clone.querySelector(".n")
          if (nEl) nEl.textContent = String(idx + 1).padStart(2, "0")
          const hEl = clone.querySelector("h4, h3")
          if (hEl) hEl.textContent = st.title
          const pEl = clone.querySelector("p")
          if (pEl) pEl.textContent = st.content
          panelParent?.appendChild(clone)
        })
      } else {
        // Universal item selector across all remaining 19 themes
        const itemSel =
          ".story-item, .s-item, .chapter, .lembar, .timeline-item, .ai, .ti, .tile.st"
        const items = storySection.querySelectorAll(itemSel)
        if (items.length > 0) {
          const firstItem = items[0] as HTMLElement
          const container = firstItem.parentElement
          if (container) {
            const templateItem = firstItem.cloneNode(true) as HTMLElement
            items.forEach((it) => it.remove())

            invitation.stories.forEach((st, idx) => {
              const clone = templateItem.cloneNode(true) as HTMLElement
              clone.classList.add("in") // ensure reveal-visible if IntersectionObserver missed it
              if (clone.classList.contains("ai")) {
                clone.classList.toggle("on", idx === 0)
                clone.onclick = () => {
                  container
                    .querySelectorAll(".ai")
                    .forEach((a, i) => a.classList.toggle("on", i === idx))
                }
              }

              const numEl = clone.querySelector(
                ".story-node, .chapter-no, .lembar-no, .story-step, .n, .no"
              )
              if (numEl) {
                numEl.textContent = String(idx + 1).padStart(2, "0")
              }

              const badgeEl = clone.querySelector(
                "small, .year, .story-date, .eyebrow"
              )
              if (badgeEl) {
                badgeEl.textContent = st.badge || `Bab ${idx + 1}`
              }

              const titleEl = clone.querySelector("h4, h3")
              if (titleEl) titleEl.textContent = st.title

              const contentEl = clone.querySelector("p")
              if (contentEl) contentEl.textContent = st.content

              const existingImg = clone.querySelector<HTMLImageElement>("img")
              if (st.photo && st.photo !== "placeholder.png") {
                if (existingImg) {
                  existingImg.src = st.photo
                  existingImg.alt = st.title
                } else {
                  const imgEl = doc.createElement("img")
                  imgEl.src = st.photo
                  imgEl.alt = st.title
                  imgEl.style.cssText =
                    "width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-top:12px;"
                  const target =
                    clone.querySelector(".story-card, .s-card, .chapter-body") ||
                    clone
                  target.appendChild(imgEl)
                }
              } else if (existingImg) {
                const imgWrap = existingImg.closest(
                  ".chapter-img, .ch-img, .pola"
                )
                if (imgWrap) (imgWrap as HTMLElement).style.display = "none"
                else existingImg.style.display = "none"
              }

              container.appendChild(clone)
            })
          }
        }
      }
    }
  }

  // =========================================================================
  // 6. GALLERY (#galeri / #gallery / #carousel) — HIDE WHEN EMPTY
  // =========================================================================
  const gallerySection = (doc.getElementById("galeri") ||
    doc.querySelector(".gallery-section")) as HTMLElement | null

  if (gallerySection) {
    const galleryUrls = (invitation.media.gallery || []).filter(
      (u) => u && u !== "placeholder.png"
    )

    if (galleryUrls.length === 0) {
      gallerySection.style.display = "none"
    } else {
      gallerySection.style.display = ""
      if (win?.CONFIG) win.CONFIG.gallery = galleryUrls

      // Hook lightbox to real galleryUrls
      let customLbIdx = 0
      const lbEl = doc.getElementById("lb-backdrop")
      const lbImg = doc.getElementById("lb-img") as HTMLImageElement | null
      const lbCounter = doc.getElementById("lb-counter")

      const showCustomLb = (i: number) => {
        customLbIdx = ((i % galleryUrls.length) + galleryUrls.length) % galleryUrls.length
        if (lbImg) {
          lbImg.src = galleryUrls[customLbIdx]
          lbImg.style.opacity = "1"
        }
        if (lbCounter) {
          lbCounter.textContent = `${String(customLbIdx + 1).padStart(2, "0")} / ${String(galleryUrls.length).padStart(2, "0")}`
        }
        if (lbEl) {
          lbEl.classList.add("active")
          doc.body.style.overflow = "hidden"
        }
      }

      if (win) {
        win.openLb = showCustomLb
        win.lbNav = (dir: number) => showCustomLb(customLbIdx + dir)
      }

      const carouselEl = doc.getElementById("carousel")
      const galleryEl = doc.getElementById("gallery")
      const masonryEl = doc.querySelector(".gallery-masonry")

      if (carouselEl) {
        carouselEl.innerHTML = ""
        galleryUrls.forEach((src, i) => {
          const s = doc.createElement("div")
          s.className = "slide"
          s.dataset.i = String(i)
          s.onclick = () => showCustomLb(i)
          s.innerHTML = `<img src="${src}" alt="Galeri ${i + 1}" loading="lazy" draggable="false"><span>${String(i + 1).padStart(2, "0")}</span>`
          carouselEl.appendChild(s)
        })
      } else if (galleryEl) {
        const existingItemClass =
          galleryEl.querySelector(".g-item")?.className ||
          galleryEl.querySelector(".g")?.className ||
          "g"
        galleryEl.innerHTML = ""
        galleryUrls.forEach((src, i) => {
          const item = doc.createElement("div")
          item.className = existingItemClass
          item.onclick = () => showCustomLb(i)
          item.innerHTML = `<img src="${src}" alt="Galeri ${i + 1}" loading="lazy">`
          galleryEl.appendChild(item)
        })
      } else if (masonryEl) {
        masonryEl.innerHTML = ""
        galleryUrls.forEach((src, i) => {
          const item = doc.createElement("div")
          item.className = "g-item"
          item.onclick = () => showCustomLb(i)
          item.innerHTML = `<img src="${src}" alt="Galeri ${i + 1}" loading="lazy">`
          masonryEl.appendChild(item)
        })
      }
    }
  }

  // =========================================================================
  // 7. GIFTS / AMPLOP DIGITAL (#gift) — ALL 20 THEMES + HIDE WHEN EMPTY
  // =========================================================================
  const giftSection = (doc.getElementById("gift") ||
    doc.querySelector(".gift-card")?.closest("section, .section-pad")) as
    | HTMLElement
    | null

  if (giftSection) {
    const accounts = (invitation.gifts.bankAccounts || []).filter(
      (a) => a.bankName.trim() || a.accountNumber.trim()
    )

    if (accounts.length === 0) {
      giftSection.style.display = "none"
    } else {
      giftSection.style.display = ""
      const cardSel = ".gift-card, .bcard, .gc, .gifts .card, .card"
      const giftCards = giftSection.querySelectorAll(cardSel)

      if (giftCards.length > 0) {
        const firstCard = giftCards[0] as HTMLElement
        const isColWrapped =
          firstCard.parentElement?.className.includes("col-") ?? false
        const unitTemplate = (
          isColWrapped ? firstCard.parentElement! : firstCard
        ).cloneNode(true) as HTMLElement
        const container = isColWrapped
          ? firstCard.parentElement!.parentElement
          : firstCard.parentElement

        // Update tideline-bento tabs if present
        const tabsWrap = giftSection.querySelector(".tabs")
        if (tabsWrap) tabsWrap.innerHTML = ""

        if (container) {
          giftCards.forEach((c) => {
            if (isColWrapped && c.parentElement) c.parentElement.remove()
            else c.remove()
          })

          accounts.forEach((acc, idx) => {
            if (tabsWrap) {
              const tBtn = doc.createElement("button")
              if (idx === 0) tBtn.className = "on"
              tBtn.textContent = acc.bankName || `Rekening ${idx + 1}`
              tBtn.onclick = () => {
                tabsWrap
                  .querySelectorAll("button")
                  .forEach((b, i) => b.classList.toggle("on", i === idx))
                container
                  .querySelectorAll(".card")
                  .forEach((c, i) => c.classList.toggle("on", i === idx))
              }
              tabsWrap.appendChild(tBtn)
            }

            const clone = unitTemplate.cloneNode(true) as HTMLElement
            const cardEl = isColWrapped
              ? (clone.querySelector(".gift-card") as HTMLElement) || clone
              : clone

            if (tabsWrap) {
              cardEl.classList.toggle("on", idx === 0)
            }

            const bankImg = cardEl.querySelector<HTMLImageElement>("img")
            if (bankImg && acc.bankName) {
              const bankBadge = doc.createElement("span")
              bankBadge.style.cssText =
                "font-weight:700;font-size:1rem;letter-spacing:0.1em;text-transform:uppercase;"
              bankBadge.textContent = acc.bankName
              bankImg.replaceWith(bankBadge)
            }

            const numEl = cardEl.querySelector(".gift-number, .c-no")
            if (numEl) numEl.textContent = acc.accountNumber

            const ownerEl = cardEl.querySelector(
              ".gift-bot b, .c-bot b, .gift-owner, p"
            )
            if (ownerEl) {
              ownerEl.textContent = ownerEl.classList.contains("gift-owner")
                ? `a.n. ${acc.accountHolder}`
                : acc.accountHolder
            }

            const copyBtn = cardEl.querySelector<HTMLButtonElement>(
              'button[onclick*="copyText"], button'
            )
            if (copyBtn) {
              copyBtn.setAttribute(
                "onclick",
                `copyText('${acc.accountNumber.replace(/\s+/g, "")}', this)`
              )
            }

            container.appendChild(clone)
          })
        }
      }
    }
  }

  // =========================================================================
  // 8. HOOK UP BUILT-IN #ucapan TO BACKEND WISHES API
  // =========================================================================
  if (win) {
    if (!win.__origRenderUcapan && typeof win.renderUcapan === "function") {
      win.__origRenderUcapan = win.renderUcapan
      // Block any late-resolving stray fetch from the theme's old demo API
      win.renderUcapan = (data: any, fromBackend?: boolean) => {
        if (!fromBackend) return
        win.__origRenderUcapan(data)
      }
    }

    const syncWishesToIframe = async () => {
      try {
        const res = await getWishesBySlugApi(activeSlug)
        const list = Array.isArray(res)
          ? res
          : res?.items || res?.wishes || res?.data || []
        if (Array.isArray(list)) {
          onWishesLoaded?.(list)
          if (typeof win.__origRenderUcapan === "function") {
            win.__origRenderUcapan(
              list.map((w: any) => ({
                nama: w.guest_name || "Tamu",
                kehadiran:
                  w.status === "not_attending" || w.status === "tidak"
                    ? "tidak"
                    : w.status === "maybe" || w.status === "mungkin"
                      ? "mungkin"
                      : "hadir",
                pesan: w.message || "",
              }))
            )
          }
        }
      } catch {
        if (typeof win.__origRenderUcapan === "function") {
          win.__origRenderUcapan([])
        }
      }
    }

    win.fetchUcapan = syncWishesToIframe
    syncWishesToIframe()

    win.kirimUcapan = async () => {
      const nameInput = doc.getElementById(
        "uc-name"
      ) as HTMLInputElement | null
      const paxInput = doc.getElementById(
        "uc-pax"
      ) as HTMLInputElement | null
      const msgInput = doc.getElementById(
        "uc-msg"
      ) as HTMLTextAreaElement | null
      const radioAttend = doc.querySelector<HTMLInputElement>(
        'input[name="attend"]:checked'
      )
      const selectAttend = doc.getElementById(
        "uc-attend"
      ) as HTMLSelectElement | null

      const guestNameVal = nameInput?.value?.trim() || ""
      const paxVal = Math.max(1, Number(paxInput?.value) || 1)
      const msgVal = msgInput?.value?.trim() || ""
      const attendVal =
        radioAttend?.value || selectAttend?.value || "attending"

      if (!guestNameVal || !msgVal) {
        if (typeof win.showToast === "function") {
          win.showToast("Mohon lengkapi nama dan ucapan")
        }
        return
      }

      const btn = doc.getElementById("btn-kirim") as HTMLButtonElement | null
      if (btn) btn.disabled = true

      try {
        const guestSlug = guestNameVal
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
        const statusMapped =
          attendVal === "tidak"
            ? "not_attending"
            : attendVal === "mungkin"
              ? "maybe"
              : "attending"

        await createWishApi({
          slug: activeSlug,
          guest_name: guestNameVal,
          message: msgVal,
          guest_slug: guestSlug,
          status: statusMapped,
          pax: paxVal,
        })

        if (nameInput) nameInput.value = ""
        if (paxInput) paxInput.value = "1"
        if (msgInput) msgInput.value = ""
        if (radioAttend) radioAttend.checked = false
        if (selectAttend) selectAttend.value = ""

        await syncWishesToIframe()
        if (typeof win.showToast === "function") {
          win.showToast("Terima kasih atas ucapan & doanya")
        }
      } catch (err: any) {
        if (typeof win.showToast === "function") {
          win.showToast(err?.message || "Gagal mengirim ucapan")
        }
      } finally {
        if (btn) btn.disabled = false
      }
    }
  }

  // =========================================================================
  // 9. FINAL SWEEPING PLACEHOLDER REPLACEMENT (UNNAMED / DEFAULT STRINGS)
  // =========================================================================
  const replacements: Array<[RegExp, string]> = [
    [/Unnamed\s*&\s*Unnamed/gi, coupleShort],
    [/Unnamed\s*\(Mempelai Wanita\)/gi, displayBrideFull],
    [/Unnamed\s*\(Mempelai Pria\)/gi, displayGroomFull],
    [/Info orang tua mempelai wanita belum diisi/gi, brideInfoText],
    [/Info orang tua mempelai pria belum diisi/gi, groomInfoText],
    [/Lokasi acara belum diisi/gi, fullLocation || "Lokasi acara belum diisi"],
    [/Lokasi belum diisi/gi, primaryEvent?.locationName || "Lokasi belum diisi"],
    [
      /Tanggal acara belum diatur/gi,
      dateParts ? dateParts.fullDateComma : "Tanggal acara belum diatur",
    ],
    [
      /Tanggal belum diatur/gi,
      dateParts ? `${dateParts.dayNumShort} ${dateParts.monthYear}` : "Tanggal belum diatur",
    ],
    [/--\.--\.----/g, dateParts ? dateParts.dotDate : "--.--.----"],
    [/--\s*·\s*--\s*·\s*----/g, dateParts ? dateParts.spacedDotDate : "-- · -- · ----"],
  ]

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node = walker.nextNode()
  while (node) {
    const tag = node.parentElement?.tagName
    if (tag !== "SCRIPT" && tag !== "STYLE") {
      textNodes.push(node as Text)
    }
    node = walker.nextNode()
  }

  textNodes.forEach((tNode) => {
    let val = tNode.nodeValue || ""
    let changed = false
    for (const [regex, rep] of replacements) {
      if (regex.test(val)) {
        val = val.replace(regex, rep)
        changed = true
      }
    }
    if (changed) {
      tNode.nodeValue = val
    }
  })
}
