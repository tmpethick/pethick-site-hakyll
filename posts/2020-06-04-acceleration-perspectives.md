-----
title: Various ways of writing Nesterov's acceleration
preamble: \usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}\usepackage{cleveref}\usepackage[dvipsnames]{xcolor}\usepackage{cancel}
link-citations: true
bibliography: ../bib/2020-06-04-acceleration-perspectives.bib
-----

Nestorov's acceleration is usually presented in the following form (AGM1)

$$
\begin{aligned}
y_{t+1} &\leftarrow x_{t}-\frac{1}{\beta} \nabla f\left(x_{t}\right) \\
x_{t+1} &\leftarrow\left(1-\frac{1-\lambda_{t}}{\lambda_{t+1}}\right) y_{t+1}+\frac{1-\lambda_{t}}{\lambda_{t+1}} y_{t}
\end{aligned}
$$

where $\beta$ is the gradient Lipschitz parameter of $f$.

The update is known to be notoriously opaque.
There are alternatives ways of rewriting the first-order scheme, however, two of which we will cover here.

## Acceleration from primal dual perspective

We want to rewrite AGM1 as the following scheme (called AGM2)

$$
\begin{aligned}
y_{t+1} &\leftarrow x_{t}-\frac{1}{\beta} \nabla f\left(x_{t}\right) \\
z_{t+1} &\leftarrow z_{t}-\eta_{t} \nabla f\left(x_{t}\right) \\
x_{t+1} &\leftarrow\left(1-\tau_{t+1}\right) y_{t+1}+\tau_{t+1} z_{t+1}
\end{aligned}
$$

where $f$ is $\beta$-smooth, $\eta_{t}=\frac{t+1}{2 \beta}$ and $\tau_{t}=\frac{2}{t+2}$.
This is a linear coupling of a small step size update ($y_{t+1}$) and a large step size update ($z_{t+1}$).

#### Derivation
Notice that the definition for $y_{t+1}$ is already the same which leaves us with verifying the update for $x_{t+1}$ and $z_{t+1}$.
Let's start by assuming that the correct update for $x_t$ exists

$$x_{t}:=\left(1-\tau_{t}\right) y_{t}+\tau_{t} z_{t}
$${#eq:x}

This leaves us with checking whether this leads to the right definition of $z_t$.
That is, we need to show that $z_{t+1} - z_{t}=-\eta_{t} \nabla f\left(x_{t}\right)$ according to the AGM2 update.
First we make a guess about the relationship between parameters,

$$
\tau_t = \frac{1}{\lambda_t}
$$

Using this after isolating $z_t$ in [@eq:x] gives us,

$$\begin{aligned}
z_{t}&=\frac{1}{\tau_{t}} x_{t}-\left(\frac{1}{\tau_{t}}-1\right) y_{t}\\ 
&= \lambda_t x_{t}-\left(\lambda_t-1\right) y_{t}.
\end{aligned}$$

Expanding $z_{t+1}-z_{t}$

$$\begin{aligned}
z_{t+1}-z_{t}&=\left(\lambda_{t+1}\left(x_{t+1}-y_{t+1}\right)+y_{t+1}\right)-\left(\lambda_{t}\left(x_{t}-y_{t}\right)+y_{t}\right)
\end{aligned}$$

Using definition of $x_t$ in AGM1,

$$
\lambda_{t+1}\left(x_{t+1}-y_{t+1}\right)-\left(1-\lambda_{t}\right)\left(y_{t}-y_{t+1}\right)=0.
$$

We can cancel terms by subtracting it

$$
z_{t+1}-z_{t} = \lambda_{t} y_{t+1}-\lambda_{t} x_{t}.
$$

We can further develop by using the update for $y_{t+1}$,

$$
\lambda_{t} y_{t+1}-\lambda_{t} x_{t} = -\frac{\lambda_{t}}{\beta} \nabla f\left(x_{t}\right).
$$

What is $\frac{\lambda_{t}}{\beta}$? If it is $\frac{\lambda_{t}}{\beta}=\eta_{t}$ then we are done. 

$$
\frac{\lambda_t}{\beta} = \frac{1}{\tau_t\beta} = \frac{t+2}{2\beta} = \eta_{t+1}
$$

So we are weirdly enough off by one since it should be $\eta_t$...

Source: [potential function paper][2], [p. 468][1].

## As momentum

NAG can be written as a momentum scheme where the gradient is queried at "a future point".

$$
\begin{aligned}
v_{t+1} &\leftarrow \alpha_t v_{t}-\frac{1}{\beta} \nabla f\left(y_{t}+\alpha_t v_{t}\right) \\
y_{t+1} &\leftarrow y_{t}+v_{t+1}
\end{aligned}
$$

#### Derivation

We start with AGM1

$$
\begin{aligned}
y_{t+1} &= x_{t}-\frac{1}{\beta} \nabla f\left(x_{t}\right) \\
x_{t+1} &=\left(1-\frac{1-\lambda_{t}}{\lambda_{t+1}}\right) y_{t+1}+\frac{1-\lambda_{t}}{\lambda_{t+1}} y_{t}\\
  &=
y_{t+1}+\frac{\lambda_{t}-1}{\lambda_{t+1}} (y_{t+1} - y_{t})
\end{aligned}
$$

Now, naturally define the momentum as $v_{t+1} = y_{t+1} - y_t$ and the parameter $\alpha_{t+1}=\frac{\lambda_{t}-1}{\lambda_{t+1}}$ for convenience.
This lets us write the above as,

$$
x_{t+1} = y_{t+1} + \alpha_{t+1}v_{t+1}
$$

This definition can be used in the update for $y_{t+1}$

$$y_{t+1} = y_t + \alpha_tv_t-\frac{1}{\beta} \nabla f\left(y_t + \alpha_tv_t\right)$$

Finally using this form of $y_{t+1}$ in the definition for $v_{t+1}$ we obtain the desired momentum update

$$
v_{t+1} = y_{t+1} - y_t
 = \alpha_tv_t-\frac{1}{\beta} \nabla f\left(y_t + \alpha_tv_t\right)
$$

Simply writing $y_{t+1}$ using the definition of $v_{t+1}$ completes the scheme

$$\begin{aligned}
v_{t+1} &= \alpha_tv_t-\frac{1}{\beta} \nabla f\left(y_t + \alpha_tv_t\right)\\
y_{t+1} &= y_t + v_{k+1}
\end{aligned}$$

Source: [acceleration as momentum][3] (appendix).

<!-- ## For sampling

Underdamped LD has a momentum interpretation.
So we can now rewrite this interpretation to AGM1 and then to AGM2 to obtain a primal-dual interpretation of acceleration in sampling.

$$
\left[\begin{array}{c}
\boldsymbol{v}_{k+1} \\
\boldsymbol{\vartheta}_{k+1}
\end{array}\right]=\left[\begin{array}{c}
\psi_{0}(h) \boldsymbol{v}_{k}-\psi_{1}(h) \nabla f\left(\boldsymbol{\vartheta}_{k}\right) \\
\boldsymbol{\vartheta}_{k}+\psi_{1}(h) \boldsymbol{v}_{k}-\psi_{2}(h) \nabla f\left(\boldsymbol{\vartheta}_{k}\right)
\end{array}\right]+\sqrt{2 \gamma}\left[\begin{array}{c}
\boldsymbol{\xi}_{k+1} \\
\boldsymbol{\xi}_{k+1}^{\prime}
\end{array}\right]
$$

with $\psi_{0}(t)=e^{-\gamma t}$ and $\psi_{k+1}(t)=\int_{0}^{t} \psi_{k}(s) d s$.

Kinetic Langevin Monte Carlo (KLMC) above was introduced in [(Cheng et al. 2017)][chengSharpConvergenceRates2019c] (derivations in appendix A).
With the exposition above taken from [(Dalalyan et al. 2018)][dalalyanSamplingLogconcaveDensity2018].
****


[accMCMC]: https://arxiv.org/pdf/1902.00996.pdf
[chengSharpConvergenceRates2019c]: https://arxiv.org/pdf/1805.01648v1.pdf
[dalalyanSamplingLogconcaveDensity2018]: https://arxiv.org/pdf/1807.09382.pdf
[chengUnderdampedLangevinMCMC2018]: https://arxiv.org/pdf/1707.03663.pdf


For non-log-concave (eq 20) uses a very similar Lyapunov function: https://arxiv.org/pdf/1805.01648v1.pdf -->

[1]: https://link.springer.com/content/pdf/10.1007/s10107-013-0653-0.pdf
[2]: https://arxiv.org/pdf/1712.04581.pdf
[3]: http://proceedings.mlr.press/v28/sutskever13.pdf
