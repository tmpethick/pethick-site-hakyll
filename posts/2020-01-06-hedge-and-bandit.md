-----
title: Hedge and Bandits
preamble: \usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}\usepackage{cleveref}
link-citations: true
-----

<!-- 
- Regret bound for Bandit (make overview)
- Explain Hedge argument precisely (the lifting trick to probability dist) 
-->

# Introduction

We will prepare ourselves for a non-convex setting that uses results for OCO.

- First derive Hedge as a particular case of FTRL.
- Introduce the Bandit setting for which Hedge can almost be immediately applied.


# Expert problem and Hedge

#### Problem formulation
In the expert problem we are to select a weighing of experts which minimize a loss that is simply the sum of losses associated with each expert.
An example of this setting could be _portfolio selection_ where each stock is an expert and the loss is the negative return.
Formalized in our OCO framework this corresponds to a decision space being the finite dimensional simplex $\Omega = \Delta_N$ and the loss linear $f_t(p) = \braket{p,\ell_t}$ for which we will further assume boundedness $\ell_t \in [0,1]$.

1. Player picks $p_t \in \Delta_N$.
2. Player observed $\ell_t$ and suffers $\braket{p_t, \ell_t}$.

We are thus interested in minimizes the following loss,

$$\mathcal{R}_{T}=\sum_{t=1}^{T}\left\langle p_{t}, \ell_{t}\right\rangle-\min _{p \in \Delta_N} \sum_{t=1}^{T}\left\langle p, \ell_{t}\right\rangle=\sum_{t=1}^{T}\left\langle p_{t}, \ell_{t}\right\rangle-\sum_{t=1}^{T} \ell_{t}\left(i^{\star}\right)$$

with $i^{\star} \in \operatorname{argmin}_{i} \sum_{t=1}^{T} \ell_{t}(i)$.

## FTRL
If we want to apply FTRL on this we need to choose the regularizer.
A natural choice when the decision set is the simplex is to choose the (negative) entropy

$$\psi(p) = \sum_{i=1}^{N} p(i) \ln p(i).$$

Our proposed solution is thus,

<div class="block--algorithm">FTRL with negative entropic regularization:
$$p_{t}=\underset{p \in \Delta(N)}{\operatorname{argmin}}\left\langle p, \sum_{\tau=1}^{t-1} \ell_{t}\right\rangle+\frac{1}{\eta} \sum_{i=1}^{N} p(i) \ln p(i).$$
</div>

## Regret Bounds
For the regret bound to go through we need to prove that the negative entropy function is strongly convex w.r.t. the $\ell_1$-norm,
<!-- TODO: explain choice of L1-norm -->

$$\psi(p)-\psi(q) \leq\langle\nabla \psi(p), p-q\rangle-\frac{1}{2}\|p-q\|_{1}^{2}.$$

Under the $\ell_1$-norm this reduces to the well-known Pinsker's inequality which relates the total variation distance (or half the $\ell_1$-norm) with the KL-divergence[^1],

[^1]: We need the deriatives of negative entropy:<br>
  $\partial \psi(p)/\partial p(i) = \ln p(i) + 1.$

$$\begin{aligned}
\frac{1}{2}\|p-q\|_{1}^{2} 
& \geq \langle\nabla \psi(p), p-q\rangle - \psi(p) + \psi(q) && \text{(rearranging)} \\
& = \sum_i q(i) \ln \frac{q(i)}{p(i)} && \text{(by expanding and seeing terms cancel)} \\
& = \operatorname{KL}(p,q).
\end{aligned}$$

Knowing that our assumptions holds we can move on to simplifying the general regret bound obtained with FTRL for our particular case.
Recall the bound,

$$\begin{aligned} 
\mathcal R_T^{\mathrm{FTRL}} \leqslant \eta \sum_{t=1}^{T}\left\|\nabla_{t} f\left(\mathbf x_{t}\right)\right\|_{*}^{2}+\frac{1}{\eta}(\max _{\mathbf x} \psi(\mathbf x) - \min_{\mathbf x} \psi(\mathbf x)).
\end{aligned}$$

We need to bound the dual norm of gradient and the term depending on the negative entropy.
For the former term we can bound it through the loss,

$$\begin{aligned} \left\|\nabla_{t} f\left(\mathbf x_{t}\right)\right\|_{*}
& = \left\|\nabla_{t} f\left(\mathbf x_{t}\right)\right\|_{\infty} && \text{(dual for $\ell_1$)} \\
&= \left\|\ell_t \right\|_{\infty} && \text{(gradient of linear loss)} \\
&\leq 1 && \text{(assumed boundedness of loss)}\end{aligned}$$

The sum of squares of these terms are thus trivially bounded by $T$.

Concerning the negative entropy: the discrete distribution which maximizes the negative entropy is a distribution with point mass while the minimum is a uniform distribution.
The negative entropy for these two distributions are $\max_p \psi(p) = 0$ and $\min_p \psi(p) = -\ln N$ respectively.
Thus we obtain the following bound[^regret],

$$\begin{aligned}
\mathcal R_T^{\mathrm{FTRL}} 
&\leq T \eta + \frac{\ln N}{\eta}\\
&\leq 2 \sqrt{T \ln N}. && \text{(optimizing $\eta$)}
\end{aligned}
$$

[^regret]: Be aware that this can be tightened to $\mathcal R_T^{\mathrm{FTRL}} \leq \sqrt{(T \ln N) / 2}$.
  See e.g. [@cesa2006prediction].

### Regret bound for samples

Say we are incurring loss $\ell_t(i_t)$ where $i_t \sim p_t$ instead of incurring the loss over the entire mixed strategy $\braket{\ell_t, p_t}$.
In expectation these are obviously the same, $\mathbb E_{i_t \sim p_t}[\ell(i_t)]=\braket{\ell_t, p_t}$.
So the following regrets

$$\begin{aligned}
\tilde{\mathcal R}_T &= \sum_{t=1}^{T}\left\langle p_{t}, \ell_{t}\right\rangle
  - \sum_{t=1}^{T} \ell_{t}\left(i^{\star}\right) \\
\mathcal R_T &= \sum_{t=1}^T \ell_t(i_t) 
  - \sum_{t=1}^{T} \ell_{t}\left(i^{\star}\right),
\end{aligned}$$

are equivalent in expectation,

$$\mathbb E[\mathcal R_T] = \tilde{\mathcal R}_T.
$$

However, we might be interested in bounded the regret with high probability instead[^high].
This can naturally be reduced to a concentration argument where we make a statement about how far most of the random variables $\ell_{t}\left(i_{t}\right)$ are from the expectation $\left\langle p_{t}, \ell_{t}\right\rangle$.

[^high]: [There is a good discussion](https://banditalgs.com/2016/10/01/adversarial-bandits/) on high probability regret bounds mainly in the context of Bandits which we will cover promptly.
  The motivation is simple: even though we might be doing well in expectation the variance might be very high.
  So our algorithm is still very risky in the sense that it is likely that a concrete instantiation will have high regret.

#### Oblivious adversary
Subtlety: the history, that the environment may depend on, is thus now a random variable.
We call the adversary _oblivious_ if it chooses the stream of losses prior to the game, i.e. the randomness of our algorithm does not effect what environment we are compared against.
This is the setting we will be considering.

Even in this simplifying setting be can still ask to bound the regret with high probability instead of the expectation.
We will use a general concentration inequality which relies on a martingale difference sequences.

<div class="block--def">(Martingale difference sequence)

$$\mathbb E[Z_t | \mathcal H_{t-1}] = 0
$$

where $\mathcal H_{i}$ is the filtration.
</div>

<div class="block--theorem">(Azuma-Hoeffding inequality)
If $Z_t$ is martingale difference sequence then

$$P\left[\sum_{t=1}^T Z_t \leq \sqrt{2 \ln (1/\delta) \sum_{t=1}^T \alpha_t^2}\right] \geq 1-\delta
$$

with $|Z_t| \leq \alpha_t$.
</div>

This readily lets us bound the regret.
Pick $Z_t = \ell_{t}\left(i_{t}\right) - \braket{p_{t}, \ell_{t}}$.
We then know that

- $Z_t$ form a martingale difference sequence since
  $\mathbb E[\ell_{t}\left(i_{t}\right) - \braket{p_{t}, \ell_{t}} | \mathcal H_{t-1}] = 0$.

- $|Z_t| \leq 2$ by boundedness assumption on the loss.

So we can apply the Azuma-Hoeffding inequality.
With probability $1-\delta$ we have

$$\begin{aligned}
\sum_{t=1}^{T} Z_{t} 
&= \mathcal R_T - \tilde{\mathcal R}_T
\leq \sqrt{8 \ln (1 / \delta) T} \Leftrightarrow\\
\mathcal R_T
&\leq \tilde{\mathcal R}_T + \sqrt{8 \ln (1 / \delta) T}\\
&\leq 2 \sqrt{T \ln N} + \sqrt{8 \ln (1 / \delta) T} && \text{(Using Hedge bound)}
\end{aligned}$$

This gives us a high probability regret bound.

<div class="block--corollary">(High probability Regret Bound)
With probability at least $1-\delta$ and $\eta = \mathcal O \left(\sqrt{\ln K / T}\right)$,

$$\mathcal R_T = \mathcal{O} \left(\sqrt{T \ln N}+\sqrt{T \ln \frac{1}{\delta}}\right).
$$
</div>

## Reducing the algorithm to Softmax

At each step we need to solve the constraint minimization problem,

$$p_{t}=\underset{p \in \Delta(N)}{\operatorname{argmin}}\left\langle p, \sum_{\tau=1}^{t-1} \ell_{t}\right\rangle+\frac{1}{\eta} \sum_{i=1}^{N} p(i) \ln p(i).$$

This turns out to have a closed form solution for our choice of regularization.

To obtain this, notice that the constraint is an equality constraint,

$$\begin{aligned}
\min_p& \overbrace{\left\langle p, \sum_{\tau=1}^{t-1} \ell_{t}\right\rangle+\frac{1}{\eta} \sum_{i=1}^{N} p(i) \ln p(i)}^{=f(p)},\\
\text{s.t.}& \underbrace{\sum_{i=1}^N p_i - 1}_{=g(p)} = 0.
\end{aligned}
$$

So we can obtain the exact solution by instead considering the Langrange function,

$$\begin{aligned}
\mathcal L(p, \lambda) 
  &= f(p) + \lambda g(p)\\
  &= \left\langle p, \sum_{\tau=1}^{t-1} \ell_{t}\right\rangle+\frac{1}{\eta} \sum_{i=1}^{N} p(i) \ln p(i) + \lambda\left(\sum_i p_i - 1\right).
\end{aligned}
$$

Setting the derivatives to zero

$$\begin{aligned}
\frac{\partial \mathcal L(p, \lambda)}{\partial p(i)}
&= \sum_{\tau=1}^{t-1} \ell_{t}(i) + \frac 1\eta (1 + \ln p(i)) - \lambda = 0\\
\Leftrightarrow\ p(i) &= \exp{\left(-\eta \sum_{\tau=1}^{t-1} \ell_{t}(i) - (1-\eta \lambda)\right)}\\
& = \exp{\left(-\eta \sum_{\tau=1}^{t-1} \ell_{t}(i)\right)} \Big/ \exp{\left(1-\eta \lambda\right)}.
\end{aligned}$$

To specify the remaining unknown, $\lambda$, we use its associated first order condition and plug-in our derived expressions for the $p(i)$'s,

$$\begin{aligned}
\frac{\partial \mathcal L(p, \lambda)}{\partial \lambda}=1-\sum_{i=1}^{N} p(i) = 0 \\
\Leftrightarrow 1 - \sum_{i=1}^N \exp{\left(-\eta \sum_{\tau=1}^{t-1} \ell_{t}(i)\right)} / \exp{\left(1-\eta \lambda)\right)} = 0 \\
\Leftrightarrow \frac{1}{\exp{\left(1-\eta \lambda)\right)}} = \sum_{i=1}^N \exp{\left(-\eta \sum_{\tau=1}^{t-1} \ell_{t}(i)\right)}.
\end{aligned}
$$

This gives us an update rule as follows:
<div class="block--algorithm">(Hedge) 
It updates $p$ element-wise as follows,

$$\begin{aligned}
&w_t(i) = -\eta \sum_{\tau=1}^{t-1} \ell_{t}(i) && \text{(Compute weights)}\\
&p_t(i) = \exp{\left(w_t(i)\right)} / \sum_{j=1}^N \exp{\left(w_t(i)\right)}. && \text{(Turn into prob. dist.)}
\end{aligned}$$
</div>

### Re-reformulation: multiplicative weight update
Alternatively we can rewrite this to save recomputation by reusing the previously computed weights.

<div class="block--algorithm">(Multiplicative Weight Update variant of Hedge)
It updates $p$ element-wise as follows,

$$\begin{aligned}
&w_t(i) =w_{t-1}(i) -\eta \ell_{t-1}(i) && \text{(Compute weights)}\\
&p_t(i) = \exp{\left(w_t(i)\right)} / \sum_{j=1}^N \exp{\left(w_t(i)\right)}. && \text{(Turn into prob. dist.)}
\end{aligned}$$
</div>
<!-- TODO: make into a one-liner -->

## Final Remarks
So to summarize: for the simplex introducing the entropy as regularizer simply reduces to replacing the max (if we were to use _Follow The Leader_) with a softmax.

This method goes by many other names in the literature apart from Hedge: Exponentiated Gradient Descent, Weighted Majority and Multiplicative Weight Update to mention the most common.

## Exercises: 

- What happens if we choose a different norm than $\ell_1$?
- What about a different regularizer than negative entropy?

<!-- 
https://haipeng-luo.net/courses/CSCI699/lecture3.pdf
https://people.cs.umass.edu/~akshay/courses/cs690m/files/lec15.pdf
https://haipeng-luo.net/courses/CSCI699/lecture2.pdf
- Duality https://www.cs.huji.ac.il/~shais/papers/OLsurvey.pdf -->


# Multi-Armed Bandit

In multi-armed bandit we consider a slight modification to the setting for which we applied Hedge.
The difference lies in considering _limited feedback_.
That is, we only observe the loss $\ell_t(i_t)$ which we incur instead of the entire function $\ell_t$.

<div class="block--def">(Bandit setting)
The player is given a fixed decision set $\mathcal K$.
At each round $t=1,...,T$:

1. Player pick $i_t \in \mathcal K$.
2. The environment picks a convex loss vector $\ell_t$.
3. The player then observes and suffers loss $\ell_t(i_t)$.
</div>

#### Exploration/Exploitation
Central to this setting is the _exploration-exploitation tradeoff_: we want to learn the best arm to pull (explore) but also pull the right arm (exploit).
It is a tradeoff since learning something about a particular arm now requires us to choose it and incur the associated loss.

#### Finite arms
Much of the notation will allow a continuos $\mathcal K$ (i.e. _infinite arms_) but we will only consider _finite arm_ bandits in this post, i.e. when $|\mathcal K| = K$.

#### Applying Hedge
We cannot naively apply Hedge as it would require full information of the previous losses $f_t$.
What we _can_ do is construct an unbiased estimator of the gradient on which we then apply Hedge.

<div class="block--lemma">(Importance-Weighted Estimator)
Say you sample $I_t \sim p_t$ and construct

$$\tilde{\ell}_{t}(i)=\begin{cases} 
      \ell_{t}(i) / p_t(i) & i = I_t \\
      0 & \mathrm{otherwise.}
   \end{cases}$$

then this estimator is unbiased

$$\mathbb E_{I_t \sim p_t}\left[\tilde{\ell}_{t}(i)\right]=\left(1-p_{t}(i)\right) \cdot 0+p_{t}(i) \cdot \frac{\ell_{t}(i)}{p_{t}(i)}=\ell_{t}(i).$$
</div>

Combining importance-weighting with Hedge leads to what has been called Exp3.

<div class="block--algorithm">(Exp3)<br>
Initialize uniformly:<br>
$w_0(i) = 0\ \forall i$<br>
Then for $t=1..T$
$$\begin{aligned}
&p_t(i) = \exp{\left(w_{t-1}(i)\right)} / \sum_{j=1}^N \exp{\left(w_{t-1}(j)\right)} && \text{(Turn into prob. dist.)}\\
&I_t \sim p_t && \text{(sample arm)}\\
&\tilde{\ell}_{t}(i)=\begin{cases} 
      \ell_{t}(i) / p_t(i) & i = I_t \\
      0 & \mathrm{otherwise}
   \end{cases} && \text{(Construct estimator)}\\
&w_t(i) =w_{t-1}(i) -\eta \tilde{\ell}_{t-1}(i). && \text{(Compute weights)}
\end{aligned}$$
</div>

#### Regret analysis

The standard FTRL analysis would fail.
To see why, let's look at the regret on our estimator

$$\tilde{\mathcal R}_T 
:= 
\leq \frac{\ln K}{\eta}+\eta \sum_{t=1}^{T}\left\|\tilde{\ell}_{t}\right\|_{\infty}^{2}.
$$

In order to say anything on the actual regret we need to take the expectation,

$$\begin{aligned}
\mathbb E[\mathcal R_T]
&= \mathbb E[\tilde{\mathcal R}_T] \\
&\leq \frac{\ln K}{\eta}+\eta \sum_{t=1}^{T}\mathbb E\left[\left\|\tilde{\ell}_{t}\right\|_{\infty}^{2}\right] \\
&\leq \frac{\ln K}{\eta}+\eta \sum_{t=1}^{T}\sum_{i\in \mathcal K}\frac{\ell_{t}(i)^2}{p_t(i)}.
\end{aligned}$$

Notice how it will blow up if $p_t(i)$ is very small for _some_ $i$ [^uniform].

[^uniform]: The initial analysis bounded the regret by explicitly exploring uniformly based on a coin flip.
  This way $p_t(i)$ was ensured to be sufficiently big for all $i$.

We can tighten the analysis, however, using some tricks almost exclusively reserved for the particular case of Exp3.

<div class="block--theorem">(Exp3 Regret bound)[^exp]

$$\mathcal R_T = \mathcal O (\sqrt{T K \log (K)).}
$$
</div>

[^exp]: proof can be found [here](https://banditalgs.com/2016/10/01/adversarial-bandits/).

<!-- <div class="proof">
We will only outline the proof here ([for a complete proof](https://banditalgs.com/2016/10/01/adversarial-bandits/)).

- Develop a bound on the exponentiated difference
  $\exp \left(\eta\left(\hat{S}_{n i}-\hat{S}_{n}\right)\right)$
- $\exp \left(\eta \hat{S}_{n i}\right) \leq \sum_{j} \exp \left(\eta\left(\hat{S}_{n j}\right)\right)=W_{n}=W_{0} \frac{W_{1}}{W_{0}} \ldots \frac{W_{n}}{W_{n-1}}$
- So study $\frac{W_{t}}{W_{t-1}}=\sum_{j} P_{t j} \exp \left(\eta \hat{X}_{t j}\right)$.
- $\exp (x) \leq 1+x+x^{2} \text { holds for any } x \leq 1$ 
- $1+x \leq \exp (x)$
- Take log on both sides.

- Note that variance would blow up (so dangerous to analyse expectation only)
</div> -->

_Remarks_:

- The lower bound for adversarial regret is $\mathcal{O}(\sqrt{TK})$[^lowerbound].
  So we achieve minimax regret up to a $\sqrt{\ln K}$ factor.
- Compared with the full information setting we are competitive up to a factor of $\sqrt{K}$.
- [Francesco Orabona](https://parameterfree.com/2019/11/12/multi-armed-bandit-i/) has a very different take on the proof coming from an Online Convex Optimization perspective that might be of interest.

[^lowerbound]: See e.g. [this proof](https://banditalgs.com/2016/10/01/adversarial-bandits/).

<!-- $$\mathbb{E}\left[\mathcal{R}_{T}\right]=\mathbb{E}\left[\sum_{t=1}^{T} \ell_{t}\left(a_{t}\right)\right]-\min _{a \in[K]} \sum_{t=1}^{T} \ell_{t}(a)$$ -->


# Final Remarks

This presentation primarily pulls from the following sources:

- The Hedge part heavily relies on Haipeng's [lecture note 3](https://haipeng-luo.net/courses/CSCI699/lecture3.pdf) except for the (standard) derivation with Langrange multiplier which I weirdly enough didn't come across anywhere.
- The Bandit part is loosly based on Haipeng's [lecture note 12](https://haipeng-luo.net/courses/CSCI699/lecture12.pdf) and [lecture note 8](https://haipeng-luo.net/courses/CSCI699_2019/lecture8.pdf) but fundamentally altered to prepare us for _Gaussian Processes with Multiplicative Weights_ which we will cover next.

I've skipped through some standard results in the Bandit literature: Explore-then-exploit and Upper Confidence Bound (UCB) to not get us too afar astray from the analysis we have seen so far in OCO.
A good starting point for the curious reader is either [Haipeng's notes](https://haipeng-luo.net/courses/CSCI699/) or [one](https://arxiv.org/pdf/1904.07272.pdf) of the  [many](https://tor-lattimore.com/downloads/book/book.pdf) books on Bandits (the literature is vast!).

<!-- # Terminology

- Oblivious (_Interestingly, any forecaster that is guaranteed to work well against an oblivious opponent also works well in the general model against any strategy of a nonoblivious opponent, in a certain sense._)
- Pseudo regret
- Stocastic vs adverserial
- Infinite arms -->
