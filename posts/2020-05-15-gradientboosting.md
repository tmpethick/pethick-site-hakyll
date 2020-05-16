-----
title: Gradient Boosting
link-citations: true
-----

When going over Gradient boosting I got confused why there was a discrepancy between the residual and the weak learner.
So here is an attempt in clearing up that confusion.

We assume we are given an imperfect model $F_i(x)$ and we want to improve it by only by additive changes $h_t(x)$, i.e.

$$F_{t+1}(x) = F_t(x) + h_t(x).$$

If we chose the perfect $h_i(x)$ this would simply be

$$y_i = F_t(x_i) + h_t(x_i) \Leftrightarrow h_t(x_i) = y_i - F_t(x) \text{ for all } i=1..N.$$

For the square loss 

$$
J = \sum_{i=1}^N (y-F(x))^{2} / 2,
$$

this turns out to simply be equivalent to the negative gradient of the loss, i.e.

$$
-\frac{\partial J}{\partial F_t\left(x_{i}\right)}=y_{i} - F_t\left(x_{i}\right).
$$

Now the crucial observation is that the class of weak learners that we allow are in general not expressive enough to capture the residual $h_t(x)$ perfectly.
So instead we choose the model $\tilde{h}_t(x)$ which minimizes this difference with this residual.

The algorithm then proceeds by updating the model

$$
F_{t+1}(x) = F_t(x) + \tilde{h}_t(x).
$$

It is thus an iterative scheme that at every step more generally _uses the negative gradient of the loss_ to build the estimator $\tilde{h}_t(x)$.
