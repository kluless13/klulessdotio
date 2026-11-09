---
title: Are prediction markets accurate
description: A short description.
short: A short blurb.
date: 2026-11-09
category: Prediction markets
series:
  id: prediction-markets
  part: 1
---
A prediction market price never sits still. It drifts, jumps, slides back. Seventy cents. Sixty-two. Then the result comes out and all of that collapses into one answer: yes or no.

It's a bit like superposition. Until the outcome lands, the price isn't a fact waiting to be revealed. It's the crowd's best guess, right now, and it keeps *changing*.

## What I looked at

686,272 trades across 2,906 settled markets on Kalshi. To score accuracy I used the Brier score. 0 is perfect, and 0.25 is what you'd get by saying 50/50 on everything.

The Brier score of the last trade before close is **0.063**.

![Kalshi prices against how often things happened](/writing/_test/fixture-chart.png)

*Prices against how often things happened.*

When the market said 80 cents, the thing happened about 84% of the time. The curve hugs the line.

## Not every market can be sharp

![A chart with no dark version](/writing/_test/fixture-card.png)

| Method | Observations | Brier score |
| --- | ---: | ---: |
| Last trade before close | 2,758 markets | 0.063 |
| All trades | 686,272 trades | 0.193 |

Where real information exists and people work hard to find it, the price gets very good.
