-----
title: Bayesian Logistic Regression
preamble: \usepackage{cleveref}\usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}
link-citations: true
-----

_I recently had to run an experiment with Bayesian Logistic Regression but didn't find a place that contained both a satisfying explanation for the motivation and derivation of the gradient._

We assume that the class label $y_i\in{0,1}$ can be predicted from the input $x_i$ and some shared latent variable $\beta$ through the logistic function $\sigma(\cdot)$,

$$
\begin{split}
P(y=1|x,\beta) &= \sigma(\beta^\top x) \quad \text{with} \quad \sigma(a)=\frac{\exp (a)}{1+\exp (a)}.
\end{split}
$$

This allows us to predict new points by marginalizing out the inferred distribution over $\beta$,

$$
p(y_* | x_*, Y,X) = \int p(y_* |x_*,\beta)p(\beta|X,Y)\ \mathrm{d}\beta.
$$

We don't know the posterior $p(\beta|X,Y)$ though.
How can we learn this distribution?
By Bayes rule we obtain,

$$
p(\beta|Y,X) \propto p(Y|X,\beta)p(\beta).
$$

#### MLE
A common way to estimate $p(\beta|Y,X)$ is by a point estimate through _maximum likelihood estimation_ (MLE).
This is simply using the mode of the log-likelihood (effectively assuming uniform prior on $p(\beta)$),

$$
\hat{\beta} = \max_\beta p(Y|X,\beta).
$$

For logistic regression there is no close form solution for the above but the negative log-likelihood is convex and positive definite so standard optimization techniques applies to find $\hat{\beta}$.
But what if we wanted to get the _distribution_ over $\beta$?

#### Approximation
$P(\beta|Y,X)$ has no nice parametric form that we know.
Usually two approaches are considered:

- Decide on a deterministic method to obtain an approximation. 
  If this lives within some chosen parametric family it is called _variational inference_. 
  the _Laplace approximation_ which construct a Gaussian around the mode of $P(\beta|Y,X)$ can also be considered such a method.
- Use _MCMC_ to draw samples from $P(\beta|Y,X)$ to construct a linear combination of point estimates as the approximation.

For either approaches the gradient is usually required.

# Derivatives of log-likelihood
In all the approaches we needed to work with the log-likelihood.
Specifically, we require the gradient.
Assuming i.i.d. samples we can write the likelihood as,

$$
L(\beta ; Y, X)=\prod_{i=1}^{N}\left[\sigma\left(x_{i} \beta\right)\right]^{y_i}\left[1-\sigma\left(x_{i} \beta\right)\right]^{1-y_{i}}.
$$

This correctly "activates" either of $P(Y_i=1|X_i,\beta)$ and $P(Y_i=0|X_i,\beta)=1-P(Y_i=1|X_i,\beta)$ depending on the value of $y_i$.

The log-likelihood is trivially,

$$
l(\beta ; Y, X)=\sum_{i=1}^{N}\left[-\ln \left(1+\exp \left(x_{i} \beta\right)\right)+y_{i} x_{i} \beta\right].
$$

The derivative of the log-likelihood (sometimes called the score) can then be shown to be,

$$
\nabla_{\beta} l(\beta ; Y, X)=\sum_{i=1}^{N}\left[y_{i}-\sigma\left(x_{i} \beta\right)\right] x_{i}.
$${#eq:grad-log-likelihood}


# In practice

The way we have defined the log-likelihood we need $y_i\in \{0,1\}$ for things to work out nicely.

# Connection with optimization

There is a nice connection with regularization if we instead of MLE did maximum a posteriori (MAP) which simply maximizes,

$$
p(\beta|X,Y) \propto p(\beta|X,Y)p(\beta).
$$

Working with the potential functions instead (i.e. the log probability),

$$
\log p(\beta|X,Y) \propto \nabla_{\beta} l(\beta ; y, X) + \log p(\beta).
$$

If we choose a Gaussian prior $p(\beta) = \mathcal N(0, \lambda I)$ this is,

$$
\log p(\beta|X,Y) \propto \nabla_{\beta} l(\beta ; y, X) + \lambda \|\beta\|_2,
$${#eq:gauss-reg}

Which is simply the negative log-likelihood with $L_2$-regularization!

# Alternatives

The two assumptions we made in the beginning can be altered:

- The logistic function can we exchange with another sigmoid function, e.g. the standard normal cumulative distribution.
- We could choose a different prior than Gaussian.
  However, it is particularly nice computationally since it makes the optimization objective strongly convex.
  Even if we try to sample the posterior $p(\beta|XY)$ instead of optimizing with MAP this is desirable.
  This is because gradient based sampling techniques such as Unadjusted Langevin Dynamics (ULA) similarly benefits from the strong convexity (see e.g. [@durmus2019analysis]).

# Resources

A resource I found useful was [Roman Garnett lecture notes][1].


[1]: https://www.cse.wustl.edu/~garnett/cse515t/fall_2019/files/lecture_notes/8.pdf


# Exercises

1. Derive the gradient of the log-likelihood in [@eq:grad-log-likelihood].
2. Verify that Gaussian is equivalent to $L_2$-regularization in [@eq:gauss-reg].
