---
title: "The 99-point gap"
description: "How often people use AI predicts how they feel about it far better than their politics, gender or age, and markets show why."
short: "How often you use AI says more about your view of it than your politics, gender or age."
date: 2026-11-09
category: "Thinking"
---

In February 2026, Data for Progress asked 1,228 likely US voters what they thought of AI. Then they split the answers the usual ways. Men and women. Young and old. Left and right.

The splits were real. The gender gap was 26 points. The age gap was 35. Politics, the thing we blame for most disagreements, was only 14.

Then they split it by how often people use AI.

People who rarely or never use it were against it by 42 points. People who use it every day were for it by 57. That's a gap of 99 points.

![The gap by AI use is far bigger than the gaps by politics, gender or age](images/gap-chart-gaps.png)

Read that again. How often you use the thing told the pollsters more about your opinion of it than your politics, your gender and your age.

## What the number means

The numbers are net favourability. Take the share of a group who like AI and subtract the share who don't. Plus 57 means far more fans than critics. Minus 42 means the opposite.

![Net favourability toward AI by gender and by how often people use it](images/gap-chart-sides.png)

Two honest caveats before I lean on it.

First, this is a correlation. Using AI might make people like it. But people who already like it are also more likely to use it, so some of the gap runs the other way. A survey can't separate the two.

Second, it's not a perfectly fair race. The AI number compares the two ends of a scale, daily against rarely or never. Gender is two groups. If you compared the most different slices of every variable, the other gaps might grow a bit.

Even with both caveats, 99 is hard to explain away. It's nearly three times the next biggest gap.

## Two groups, two different things

What strikes me is that the two groups aren't really disagreeing about the same thing.

A daily user has an opinion about a tool they used this morning. It drafted an email, or fixed a bug, or got something wrong and they noticed. Their view is built from a pile of small, boring encounters.

Someone who never uses it has an opinion about AI too. But it's built from somewhere else. Headlines, a friend's worry, a film. The political scientist John Zaller argued back in 1992 that this is how most opinions work: when someone asks you, you build an answer on the spot from whatever you've heard lately.

And what you've heard lately about AI is mostly scary.

Paul Slovic has spent his career studying why people fear the things they fear. He found that two things make a risk feel bigger: dread, and the unknown. A risk that feels catastrophic and out of your control, and that you don't understand, feels far worse than its odds. A familiar one feels smaller than it is.

To someone who has never used it, AI scores high on both. It's new, it's invisible, and its best-known stories are science fiction. To a daily user it's mostly a thing that writes first drafts. It's hard to dread something you've watched get a date wrong.

So one group is judging a tool. The other is judging a story about a tool.

## I was on the other side once

I'm a daily user, so I'm in the plus 57 group. Read my take with that in mind.

But I didn't start there. When ChatGPT came out at the end of 2022, I was doing a masters in marine science in Australia, years after deciding I wasn't a programming person. I've written about [how that changed](/writing/im-not-a-programming-person).

That Christmas I started learning to code. Today I build most of what I ship with AI tools, every day.

My first time with AI was GPT-3.5, in OpenAI's Playground. I used it to outline content for essays, and I was shocked by how good it was.

Nobody argued me into my view. I didn't read a better article. I used the thing, a lot, and the story I'd had about it got replaced by experience.

## Nothing makes you check

Here's the part I think goes beyond AI.

Most beliefs never get tested. You can hold an opinion about AI for years, and if you're wrong, nothing happens. No bill arrives. The opinion just sits there.

Worse, a scary opinion keeps itself safe. If you think AI is dangerous, you're less likely to try it. If you don't try it, you never collect the experience that might change your mind. The belief survives because it never meets anything.

I can think of two ways a belief gets checked.

The first is the one in the survey: direct experience. You use the thing.

The second is what Nassim Taleb calls skin in the game. You have something to lose if you're wrong. That's where prediction markets come in, and it's why I care about them.

## A poll asks. A market charges.

In a poll, your answer is free. Say whatever you like. Right or wrong, nothing comes back to you.

In a prediction market, your belief has a price. You buy a contract that pays a dollar if something happens. If you're wrong, you lose what you paid. If you're right, you collect from someone who was wrong.

![In a poll nothing comes back to you; in a market the result does](images/gap-diagram-poll-vs-market.png)

I've spent a lot of time in this data, and two findings fit here.

On Kalshi, I looked at 686,272 trades across 2,906 settled economic markets, from a December 2025 snapshot. The last price before each market closed was close to the truth. I wrote about that in [an earlier post](/writing/are-prediction-markets-accurate).

On Polymarket, across about 248,000 traders, the 1,000 most profitable traders, fewer than one in 200, took 62% of the profits. Money flows, heavily, from people who were wrong to people who were right.

That's the mechanism. The market doesn't need everyone to be right. It just charges people for being wrong, and the charge moves the price.

I'd love to tell you my data shows the best traders are the ones who change their minds fastest when reality disagrees. I think that's true. But I didn't measure it, so treat it as my opinion. What I did measure is that being wrong costs money, and that the money ends up with a small group.

The 2024 US election is a good picture of the difference, if not proof of anything. For weeks before the vote, Polymarket had Trump as the favourite. On the eve of the vote he sat between 56% and 62%. The polling averages were close to a tie. Trump won. One election proves very little. A 60% favourite is supposed to lose four times in ten. But it shows the two tools asking different questions. The polls asked people what they thought. The market asked them what they'd pay.

## Back to the gap

The 99 points are about AI. I don't think the pattern is.

Most of us hold confident opinions about things we've never touched: technologies, places, jobs, people. Those opinions came from somewhere, and it usually wasn't us.

So the question I've started asking myself is simple. For any belief I hold strongly: have I used it, or have I just heard about it? And if I'm wrong, does anything happen to me?

If the answer is "heard about it" and "nothing", I hold it more loosely.

That's why I keep coming back to prediction markets. They're the one place I know where a belief can't just sit there. If you're wrong, it costs you, and the price moves. I use them often. I'm even building one with the team: [Truflation Predict](https://predict.truflation.com), prediction markets on economic data. *(I work at Truflation, so read this part with that in mind.)*

---

*Survey data: Data for Progress, February 2026, 1,228 likely voters. Market data from Kalshi and Polymarket, December 2025. Code: [the research repo](https://github.com/kluless13/pm-data-analyses)*
