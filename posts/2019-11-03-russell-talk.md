-----
title: Provably Beneficial Artificial Intelligence
preamble: \usepackage{cleveref}\usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}
-----

Stuart Russell came to EPFL last Friday to talk about his new book on [Human Compatible: Artificial Intelligence and the Problem of Control][book].
Broadly speaking there were two main messages: first we should avoid specifying fixed objectives and instead learn them in a dynamic environment where the agent adhere to the human.
His second main talking point was on the problem of how we aggregate utility -- a similar problem to what the Extreme Altruism movement face.
I will expand on these in a bit but let's first look at how he opened. 

#### A confused kicker 
He had a catchy opening illustrating the lack of robustness in modern RL methods.
It showed to adversary player's: one a a goal keeper and the other the kicker.
He showed that a seemingly useless (but hilarious) strategy of the goal keeper could completely confuse the kickers ability to score.
What we end up looking at is a goal keeper who simply lies down and wiggle's it's leg.
This is apparently sufficient to render the kicker utterly incapable -- the agent will indecisively dance around the ball.
With a well-behaved opponent the kicker motorics and strategy is very human, but this lack of robustness in an averserial setting shows that something very different is going on under the hood.
As Stuart Russell puts it: the two agents are intertwine in some intricate dance of tango.
Now, of course in this zero-sum game dependency is inherent.
The problem is that most of the training signal of the kicker seems to depend on the actions of the opponent instead of treating it as noise.
What I could imagine is happening is the following: by actively not having the goal keeper search for an optimal strategy we make it harder to converged to a stable strategy.

#### Sample efficiency
In effect it boils down to being much less sample efficient when the opponent act adversarially. 
That is, it requires many more samples from the environment before convergence to a stable solution.
Here he drew a comparison with humans who are masters at few-shot learning[^giraffe] -- they learn classification tasks and master complicated decision processes with only a few training examples.
He never connected the two but my interpretation is that robustness is essential to achieve this human level ability.
This is simply because robustness will give you sample efficiency which corresponds to few-shot learning.

[^giraffe]: He had a nice picture of this: children don't scroll through a book with thousands of picture of giraffe's to understand the concept of a giraffe. 

#### Motivation
This picturesque introduction showed how brittle these systems are and how that can lead to unwanted behavior.
He then switched gears to argue that a system, which on the contrary is _not_ stupid[^power], could still exhibit undesired behavior.
Assuming we could build capable systems, why would we have to control them?[^argument]
The strongest and most interesting[^complex] argument for me was the parallel to nuclear power: ensuring that machines with a super human level of intelligence are safe is not so different from ensuring safety of existing powerful complex systems -- in particular nuclear power plans.
He continued by saying that the power of the system is not problematic in itself: it is only a problem if the objective of the system is misaligned with us.

[^power]: He had one casual remark I found very provocative.
  When arguing for how great a personal assistant could get he said something along the lines of:
  "It will know what you want from listening in on your conversation and from reading your emails".
  He said this seemingly seriously optimistic about what could turn into an uncontrolled surveillance system.
[^argument]: To me this seems almost unnecessary arguing for.
[^complex]: This is interesting in its own right: 
  it shows that AI systems and existing complex decision making processes could be treated similarly. 
  We'll touch on this further down the post.

# Misspecified Objective

This is often referred to as the _alignment problem_ in AI.
To clarify how difficult it is to define the right objective he took a particular view on what he referred to as _the social media catastrophe_.
As I understand it, this is the problem of social media advocating extreme polarized opinions and misinformation.
He explained this by first pointing out that the system benevolently were optimizing for good recommendation[^money].
However, it turned out that it was an easier optimization problem to modify people's behavior to be more predictable instead of learning their original objective.
Thus polarizing peoples opinion gave a stable solution that could be gamed.
Whether this is truly what happened is not entire clear, but it does show why optimizing in a dynamic environment is hard.

[^money]: He later did point out that what they truly optimize for is profit.
  But this benevolent view makes it clearer that even with a well-intended objective it can go wrong.

#### Cooperation as complex agents
At this point he took an interesting take on the corporations involved in this catastophe.
He viewed the whole corporation as a big complex decision making algorithm -- which crucially couldn't be switched off.
Through that, he motivated why any intelligent system should allow itself to be switched off. 
However, he only used the view to make this one argument, but failed to comment on the importance of the connection in itself.
On a high level, AI and the complex decision making systems we already have can be treated the same and studied under the same umbrella.
It suggest that studying safety in AI can help us regulate existing systems such as social economic structures.
Conversely maybe we could use existing studies to guide safety research in AI.

#### Solutions
Broadly speaking the social media example captures the two main problems: 1) we need to be able to switch the system off; and 2) we cannot assume that the objective can be specified completely and correctly a priori[^miw].
We will now touch on how he modelled this.

[^miw]: As an aside, he also mentioned how systems should be _minimally invasive_.
  That is, don't for example destroy the town to bring coffee to the human.
  But this does not really provide many guarantees.
  In addition, this property is to a certain extend already taken care of in most algorithms since they usually have a level of greediness.
  The cheapest solution to compute will often also be the less involved.

#### Assistance Games
He modelled the problem as a two-player game with a human and a robot.
The human has an objective $\mathbf \theta$ which can only be observed by the robot through play.
The robot starts with some prior $p(\mathbf \theta)$ over this unknown objective and then tries to both learn and optimize the true objective[^inverse].

[^inverse]: To me this seems very closely related to _inverse reinforcement learning_ in which the reward function is unobservable but trajectories from a _teacher_ with an optimal policy are accessible.

#### Image classification
Even for static tasks he argued that a dynamically learned loss is needed.
Current models assumes uniform loss even though this is clearly not the case.
To make his point clear he picked the example of Google wrongly classifying a human as a gorilla.
The cost of patching up their brand after this mistake was clearly out of proportions with any other misclassification they could have made.
As a research direction he proposed finding the underlying structure in these losses (since they clearly exists) and doing this through active learning.
In generally he suggested develop dynamic, or dynamically learned, losses in all current applications.

#### Online Convex Optimization 
At the moment I'm instantly seeing everything as an Online Convex Optimization problem.
In this setting we exactly avoid specifying a fixed objective -- on the contrary the environment gets to choose the stream of losses adversarially.
In the case of an unknown objective the loss is not really changing adversarially.
Rather, it is our _estimate_ of the loss which changes over time and the challenge seems to be that we have _limited access_ to the loss, which is something considered in the Multi-armed Bandit setting.
So it does not seem to be the usual online setting but some of the tools might still be useful in the analysis of Assistance Games -- at least the notion of regularization and robustness.

# Aggregating Utility

The second main topic he touched on was the problem of aggregating utility.
There were three rather disjoint comments on this.

#### Pareto paper
Imagine an agent optimizing for a group of principals who have different utility functions.
Usually we are interested in a Pareto optimal policy.
That is, a policy where no principal can improve without making sacrifices for one of the others.
Harsanyi's theorem shows that when the principals share a common prior of the environment dynamics then the Pareto optimal strategy for the agent is a fixed linear combination of all the principals utilities.
What Russell and his colleges shows in [@desaiNegotiableReinforcementLearning2018] is that in the more general setting more weight should be given to the principle that turns out to be right.
Exactly what to make of this theoretical result is a little unsure.

#### Sadism
Assume that Alice's utility can be described by a linear combination of her own satisfaction $w_A$ and her friends, Bob's, satisfaction $w_B$,

$$u_A = w_A + C_{AB} w_B.$$

If $C_{AB}$ is negative Ali is sadistic since she obtain pleasure from the dissatisfaction of Bob.
This raises the question of what we should optimize for.
A simple solution would be to completely disregard the preference of sadistic people.
However, sadistic people are not so uncommon when we realise that Pride and Rivalry would have the exact same mathematical description[^sadism].

[^sadism]: I am not too sure I see how this complicates matters since we could simply ignore any negative coefficient $C_{AB}$.
  I realise that in a simplified static world this is suboptimal.
  But we have to acknowledge that peoples preferences will update and ethically I think we can agree that we want to stir away from pride and rivalry.
  If we do not support this kind of utility in our reward system there a higher chance it will diminish.

#### Optimizing jointly
As a final example on problems with optimizing a global utility he gave a comical image: picture a kitchen robot denying its owner food because its decided that there are more urgent matters in some third-world country.
This capture more of an engineering challenge and to me seem very flawed.
It is misleading since the optimization process would be jointly but the _action space_ consider would be for each robot individually.
So it does not seem like a real issues: neither theoretical nor practically.

# Final remarks

Being careful with what we are optimizing for definitely seems crucial.
This is both in terms of learning or adjusting to a changing objective and understanding what we implicitly assume when aggregating the utility.
Further, I don't see why these questions are only relevant within AI safety.
Extreme Altruism is about optimizing the optimization process and here a proper definition of utility is even more important.


[book]: https://www.amazon.com/Human-Compatible-Artificial-Intelligence-Problem/dp/0525558616
