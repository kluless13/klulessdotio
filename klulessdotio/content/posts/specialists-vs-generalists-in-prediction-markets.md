---
title: "Do specialists or generalists win? I checked my own 124x"
description: "I found generalists out-earning specialists 124 to 1, then checked and found most of that gap was just trade size."
short: "My 124x generalist advantage turned out to be mostly size. I wanted it to be true, so I checked twice."
date: 2026-11-09
category: "Prediction markets"
series:
  id: prediction-markets
  part: 5
---

The common advice says pick a lane. The politics junkie should beat the politics markets. The sports nerd should beat the sports markets. Know one thing deeply and you'll have an edge over everyone who knows a bit about everything.

I've never believed it. One thing affects everything. Actions and events are chain-linked, and to understand one of them you need to see the rest. It's the old split between the hedgehog, who knows one big thing, and the fox, who knows many. I'm a fox all the way. Look at this website.

So I went to Polymarket hoping the data would agree.

The first answer I got was the one I wanted, and it was huge. Generalists made 124 times more than specialists. I wrote it up on Substack as "The 124x generalist advantage".

Then I went back to check it. This post is what I found the second time, and it replaces that one.

## What I looked at

Polymarket has a leaderboard for each of eight categories: politics, sports, crypto, culture, economics, tech, finance and weather. Each one ranks traders by how much money they've made in that category. Politics lists the top 5,000. The others list about the top 10,000.

My data has about 248,000 Polymarket traders. 59,626 of them show up on at least one of those category boards. That's the sample here, because they're the only traders I have category data for. Everyone else either never ranked in a category or only traded markets without a category tag. The data is from December 2025.

I sorted them by how many boards they appear on:

- **Specialist:** one board. 50,048 traders, 84% of the sample.
- **Generalist:** five or more boards. 715 traders, about 1%.
- Two to four boards sit in between.

## The 124x

Here's median profit by number of boards. The median is the middle trader: half made more, half made less.

![Median profit climbs with each extra leaderboard](images/sg-chart-ladder.png)

The middle specialist made $284. The middle generalist made $35,280. That's where 124x comes from.

My first worry was that a few whales were pulling the number up. They weren't. It's a median, so outliers barely move it. If anything, the average shrinks the gap. The average specialist made $7,419 and the average generalist made $114,422. That's 15x, not 124x, because the specialist average gets dragged up by a handful of huge election winners.

So the arithmetic is right. The problem is what the labels mean.

## What "specialist" really meant

The label counts leaderboards, not categories traded.

You only appear on a board if you made enough money in that category to rank. So a trader who dabbles in all eight categories but makes small money in each might appear on one board, or none. In my data they'd be a "specialist", or not in the sample at all.

To be a "generalist", you had to win enough to rank in five different categories. That takes a lot of trading. So the comparison isn't really "people who trade one thing against people who trade many things". It's closer to "people who won in one place against people who won in five places". Of course the second group made more.

And the boards aren't equally hard to get onto. In an earlier pull of the top 5,000 on each board, getting onto the weather board took $14 of profit. Getting onto the politics board took about $4,000.

![Specialists' median profit by the one board they appear on](images/sg-chart-specialist-mix.png)

A weather specialist and a politics specialist get the same label. The middle one made $39 and the middle one made $9,098. Five of the eight boards are cheap to get onto, so the "specialist" group is full of small winners from those boards, and its median sinks.

There's a tell that the 124x is about the leaderboards and not about the traders. In that earlier pull, the same calculation gave 59x. When I went deeper, to about 10,000 per board, I added thousands of small traders from the bottom half of the boards. Most of them landed in the specialist group. The ratio doubled. A number that doubles when you change where Polymarket stops the list isn't measuring skill.

## Comparing like with like

To get a fairer comparison, I needed traders on the same footing. The overall leaderboard does that: one profit number and one volume number per trader, across everything they traded. Volume is the total value of all their trades.

I had 4,985 traders from the overall top 5,000 in that earlier pull. Among them, the middle specialist made $24,758 and the middle generalist made $77,138. That's about 3x.

Still a gap. But the generalists also traded far more. Their median volume was $9.4 million. The specialists' was $306,000. That's about 30 times as much money moved.

So I matched them by volume, comparing traders who moved similar amounts.

![Median profit by volume band, specialists and generalists](images/sg-chart-matched.png)

Between $1 million and $10 million traded, it's $49,077 against $51,781. Basically even. Above $10 million, the specialists were ahead. Under $1 million there are only 20 generalists, so I wouldn't read much into that row.

Here's the whole thing in one picture.

![The gap shrinks from 124x to about 1x](images/sg-chart-shrink.png)

124x for the middle trader overall. 15x on averages. 3x among the top 5,000. About even once you match on size.

## What does hold up

The biggest winners were specialists. The top ten traders on the whole overall leaderboard all appear on just one board, and it's politics every time. Most of that money came from the 2024 US election.

Read that again. In a study that said generalists win by 124x, the ten biggest winners were all specialists.

That doesn't flip the result either. Ten people are ten people, and one election was a once-in-four-years event. It does tell you that "specialise" and "spread out" can both make money, and the leaderboard labels can't tell you which approach caused it.

One more number I find interesting. Among the top 5,000, specialists made about 11 cents per dollar traded. Generalists made about 1 cent. That sounds like a win for specialists, but I don't think it is. Bigger traders make thinner margins in general, and the generalists were much bigger. It's size again, showing up from the other side.

## What I take from it

My first write-up came with theories. Generalists win because reasoning skills transfer and domain knowledge doesn't. Specialists get overconfident in their own field and size up too much. Those are nice stories. The data I had can't support them, because the label I built them on mostly measures how big a trader is.

To really answer the question, I'd need every trade each person made, sorted by category, so a specialist means someone who actually only trades one thing. Leaderboard placement is a list of winners, and you can't learn much about how people lose from a list of winners. (It also counts open positions, so some of these profits could still change.)

So, do specialists or generalists win? From this data, I can't tell you. Traders of similar size did about the same either way. The single biggest fortunes went to people who stuck to one thing.

That's not the answer I wanted. The hedgehog and the fox comes from an essay by Isaiah Berlin, and Philip Tetlock, who spent years scoring expert predictions, found that the foxes forecast better. I still think the fox is right. Everything is connected, and I wanted the 124x to prove it. It doesn't. The gap is mostly size. The fox may well win, but a list of winners can't show it.

What I can tell you is to be suspicious of a number like 124x. Including when it's mine, and especially when I wanted it.

---

*Method, full paper and code: [the research repo](https://github.com/kluless13/pm-data-analyses). Data from Polymarket, December 2025.*
