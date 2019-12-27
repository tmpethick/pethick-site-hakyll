-----
title: Gaussian Process Posterior is Unbiased
preamble: \usepackage{cleveref}\usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}
link-citations: true
-----

Recently I required the GP posterior to be _unbiased_.
This is a very trivial fact but I haven't seen it explicitly written anywhere.

Assume we have some function drawn from a GP prior $f \sim \mathcal{GP}(m(\mathbf x), k(\mathbf x,\mathbf x'))$.
By the definition of GPs we can equivalently think of it as a multivariate Gaussian on a finite subset of the infinitely many random variables that make out $f$

$$
\left[\begin{array}{l}{\boldsymbol{y}_1} \\ {\boldsymbol{y}_{2}}\end{array}\right] \sim \mathcal{N}\left(\left[\begin{array}{l}{\boldsymbol{\mu}_1} \\ {\boldsymbol{\mu}_{2}}\end{array}\right],\left[\begin{array}{cc}{\mathbf{K}_{11}} & {\mathbf{K}_{12}} \\ {\mathbf{K}_{21}} & {\mathbf{K}_{22}}\end{array}\right]\right).
$$

Now, for a random function, represented by $\left[\begin{array}{l}{\boldsymbol{y}_1} \\ {\boldsymbol{y}_{2}}\end{array}\right]$ we want the prediction to be unbiased.
In other words, we want $E[\hat{\mathbf y}_1|\mathbf y_2]y= \mathbf x_1$.
We simply let $\hat{\mathbf y}_1$ be the prediction of our model.
That is, for some randomly drawn function 

$$
\begin{split}
E_{\mathbf y_1, \mathbf y_2}[E[\hat{\mathbf{x}}_1 | \mathbf x_2]] \\
= E_{\mathbf y_1, \mathbf y_2}[\mathbf \mu_1 - \mathbf \Sigma_{12}\mathbf \Sigma_{22}^{-1} (\mathbf y_2 - \mu_2) - \mathbf y_1] 
\end{split}
$$


These calculations crucially didn't even mention the input locations.
_So the unbiasness is completely independent of where we sample_.

In this setup we have assumed that the GP from which $f$ is drawn is _known_.
Usually only some function family is assumed known but with unknown hyperparameters.

The unbiasedness of the posterior is interesting because it allows us to readily plug it into the Exp3 analysis in the Multi-armed Bandit setting for _infinite_ arms.
The result should not be so surprising since GP pops out of Kriging which is _based on the assumption that the estimator is unbiased_.

% https://projecteuclid.org/download/pdf_1/euclid.lnms/1215006768
