---
title: "Do winning traders keep winning?"
description: "A good month on Polymarket tends to be followed by another, practice alone doesn't help, and betting bigger after a win is the risk."
short: "A good month means something. Practice alone doesn't. The danger is betting bigger after it works."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 6
---

The most profitable trader in my data goes by Theo4.

Their first deposit on Polymarket was $400, on 14 October 2024. Another $9.2 million followed. At the end of October the account was down $16,000. At the end of November it was up $22 million. That was the US election.

Then the line goes flat. For almost a year, nothing.

That's one journey. I wanted to know what the usual one looks like. Does a good month mean anything? Do winners keep winning? And do people get better the more they trade?

Why care? Financial products should adapt to how traders actually behave. You can't build that until you know how traders change.

## What I looked at

Two sets of Polymarket data, both from December 2025.

The first is monthly profit histories for 599 traders, straight from Polymarket's own API. Most came from the leaderboard, and the histories go back to November 2023 at the earliest. 83% of these traders ended up in profit, so this is mostly a sample of winners. Keep that in mind.

The second is 2.68 million closed positions from 3,765 traders. A position is everything one trader did in one market. These traders were picked on purpose from across the range: big winners, big losers, whales, break-even, and everyone between.

I've written before about how unequal the profits are. The 1,000 most profitable traders, fewer than one in 200, took 62% of them. This post is about the other direction: time.

## My first answer was wrong

The first time I ran this, the answer looked clean. Hot streaks fade.

I found 122 streaks where a trader made money three months or more in a row. Only 47% of them made money over the next three months. During the streaks, the average trader made $836,769. In the three months after, they lost $146,220.

It's a neat story. Hot hand, overconfidence, regression to the mean. I nearly wrote it.

Then I looked at how I'd counted.

A streak ends when a month doesn't make money. My "three months after" started on that month. So every one of them began with a loss, by definition. Those streak-ending months lost about $216,000 on average, more than the whole three-month loss. The test was built to say "fade".

![How the hot streak test was counted](images/tj-chart-counting.png)

The fair way is to start the clock the moment a trader hits three winning months, then look at the next three, whatever they turn out to be. 80% of those made money. Any three active months, picked at random, made money 76% of the time.

So streaks don't fade. They also don't add much.

## Winners do keep winning

Break it down month by month.

![A winning month was usually followed by another](images/tj-chart-streaks.png)

After a winning month, the next month made money 79% of the time. After a losing month, 63%. After three winning months in a row, 83%. The average month sits at 75%.

So a good month tells you something. But is that a hot hand, or just a good trader?

I checked by comparing each trader with themselves. For the 67 traders with enough history, a winning month made the next one about 8 points more likely to win than a losing month did. Across everyone, the gap is 16 points.

So about half the gap comes from who the trader is. The other half is a smaller lift from the month itself. Some traders are good, and they stay good. The streak matters less than the trader.

Two caveats. This is 599 traders, mostly winners, so it tells you how winners behave, not everyone. And a sample of people who ended in profit will be full of good months. What it does say is that among people who made it, success wasn't one lucky month followed by a crash.

## But the money comes in one month

Here's the twist. Winning months are common. Winning money is lumpy.

Take the 209 traders who ended in profit and had at least six months of history. For the middle one, a single month made 63% of their total profit. For 40% of them, one month made 80% or more.

Theo4 isn't that unusual. Lots of quiet months, and one that matters.

## Practice didn't make better pickers

Now the journey from the start.

Most journeys start small. Among 1,562 traders whose deposit history I saved, the median first deposit was about $300, and 96% added more money later. A test, then something bigger.

Then the trades. I put every trader's positions in order and asked: did their early bets win less often than their later ones? If people learn, the first ten should be the worst.

![First bets won as often as the hundredth](images/tj-chart-first-trades.png)

They weren't. The first ten positions made money 62% of the time. Positions 101 to 110 made money 59% of the time. In between, it's flat.

The drop to 52% after position 110 looks like people getting worse. It isn't the same people. 93% of all positions sit in that last bar, and most come from a small group of very busy traders, some with thousands of positions. They win a bit more than half the time. Different traders, different style.

Why no learning curve? I can think of two reasons, and the data can't split them. Traders who were bad may have quit early, so they never reach the later bars. Or people arrive with whatever edge they have, and practice doesn't change it much.

My guess is the first. People quit fast. The ones who aren't good leave early, so the later bars are mostly people who stayed.

I also checked whether people bet smaller as they go. The first ten positions were slightly bigger than a trader's average. After that the typical bet barely moved. I wouldn't call that learning caution.

## One in three gives it back

This is the number that stuck with me.

Of the 3,137 traders with at least five positions, 997 blew up. That's 32%. By blow-up I mean they were up at some point, then fell all the way to a loss at least half the size of their best. Up $10,000 at the peak, down $5,000 or worse later.

It fits what I've seen. Many high conviction traders have blown up. Not one story in particular, just a pattern.

How did they differ from everyone else?

- They won less often: 55% of positions against 65%.
- They traded far more: 1,534 positions on average against 537.
- Their biggest bet was 42 times their average bet, against 20 times.

What didn't predict it was one giant loss. Their largest single loss was 28% of all their losses on average, against 39% for everyone else. They didn't get wiped out in one go. They leaked.

One caution. The more positions you place, the more chances you have for one oversized bet. So part of that 42x is just that they traded so much.

## What I take from it

A good month means something. Mostly because good traders have good months, not because the month made them hot.

Practice, on its own, didn't make people better at picking. Their first bets won about as often as their hundredth.

And the danger isn't one bad bet. It's trading more and betting bigger after it's worked, until the gains leak away.

So judge a trader, or yourself, on the long record. Not the last month, and not the best one.

---

*Method, full papers and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Polymarket, December 2025.*
