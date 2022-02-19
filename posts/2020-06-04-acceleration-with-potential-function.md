-----
title: Acceleration convergence using a potential function
preamble: \usepackage{amsmath}\usepackage{braket}\usepackage{amssymb}\usepackage{amsthm}\usepackage[utf8]{inputenc}\usepackage{cleveref}\usepackage[dvipsnames]{xcolor}\usepackage{cancel}
link-citations: true
-----

We cover the analysis of acceleration from [this paper][1].
The main motivation is to fill in some of the details that has been left out most likely for clarity.
<!-- (motivation for the potential function, the rewriting of the update into mirr+grad, an explanation of where we use the slow moving process $z_{t}$). -->

## Rewriting in terms of Mirror descent

We can write NAG:
$$
\begin{array}{l}
{x}_{k+1}={y}_{k}-\alpha \nabla f\left({y}_{k}\right) \\
{y}_{k+1}=\left(1-\gamma_{k}\right) {x}_{k+1}+\gamma_{k} {x}_{k}
\end{array}
$$

as 

$$\begin{aligned}
y_{t+1}&= x_{t}-\frac{1}{\beta} \nabla f\left(x_{t}\right) \\
z_{t+1}&= z_{t}-\eta_{t} \nabla f\left(x_{t}\right) \\
x_{t+1}&=\left(1-\tau_{t+1}\right) y_{t+1}+\tau_{t+1} z_{t+1}
\end{aligned}$$

where $f$ is $\beta$-smooth, $\eta_{t}=\frac{t+1}{2 \beta}$ and $\tau_{t}=\frac{2}{t+2}$ (See e.g. [this paper][2]).
This is the scheme we will be analysing.

## Convergence 

the general strategy is using potential function goes like this:

1. Define a potential function 
   
   $$
   \Phi_{t}=a_{t} \cdot\left(f\left(x_{t}\right)-f\left(x^{*}\right)\right)+b_{t}.
   $$

2. Find bound for $\Phi_{t+1}-\Phi_t \leq B_t$.
3. Get convergence by telescoping the difference,
  
    $$\sum_{t=0}^{T-1} \Phi_{t+1}-\Phi_{t} \leq \sum_{t=0}^{T-1} B_t \Rightarrow f\left(x_{T}\right)-f\left(x^{*}\right) \leq \frac{\Phi_{0}+\sum_{t=1}^{T-1} B_{t}}{a_{T}}.
    $${#eq:phi-sum}


#### Acceleration
- For acceleration we start with the potential $a_t=t(t+1)$ and $b_t={2} {\beta} \cdot\left\|{z}_{t}-{x}^{*}\right\|^{2}$

    $$
    \Phi_t=t(t+1) \cdot\left(f\left(y_{t}\right)-f\left(x^{*}\right)\right)+2 \beta \cdot\left\|z_{t}-x^{*}\right\|^{2}.
    $$

    This suggests that we will apply primal analysis to $y_t$ and dual to $z_t$.

- We want to bound the difference $\Phi_{t+1}-\Phi_{t}$ which we can expand as 
  
    $$\begin{aligned}
    \Phi_{t+1}-\Phi_{t} = 
    &t(t+1) \cdot\left(f\left(y_{t+1}\right)-f\left(y_{t}\right)\right)\\
    &+2(t+1) \cdot\left(f\left(y_{t+1}\right)-f\left(x^{*}\right)\right)\\
    &+ 2 \beta (\left\|z_{t+1}-x^{*}\right\|^{2} - \left\|z_{t}-x^{*}\right\|^{2}).
    \end{aligned}$$

- Using $\|a+b\|^{2}-\|a\|^{2}=2\langle a, b\rangle+\|b\|^{2}$ (for euclidean norm) and the update for $z_t$
 
    $$
    \frac{1}{2}\left(\left\|z_{t+1}-x^{*}\right\|^{2}-\left\|z_{t}-x^{*}\right\|^{2}\right)=\frac{\eta_{t}^{2}}{2}\left\|\nabla_{t}\right\|^{2}+\eta_{t}\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle$$

    we rewrite

    $$\begin{aligned}
    \Phi_{t+1}-\Phi_{t} \leq & t(t+1) \cdot\left(f\left(y_{t+1}\right)-f\left(y_{t}\right)\right)\\
    &+2(t+1) \cdot\left(f\left(y_{t+1}\right)
    -f\left(x^{*}\right)\right)\\
    &+4 \beta\left(\textcolor{blue}{\frac{\eta_{t}^{2}}{2}\left\|\nabla_{t}\right\|^{2}+\eta_{t}\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle}\right)
    \end{aligned}$$

    _Interpretation: we want $\|\nabla_t\|$ to be small for $x_t$ to improve the most._

- $\beta$-smooth and the update rule for $y_{t+1}$ gives us

    $$\begin{aligned}
    f(y_{t+1}) - f(x_t) 
    &\leq \langle\nabla_t, y_{t+1}-x_t\rangle+\frac{\beta}{2}\|y_{t+1}-x_t\|^{2} && \text{(smoothness)}\\
    & \leq \langle\nabla_t, -\frac{1}{\beta}\nabla_t\rangle+\frac{1}{\beta 2}\|\nabla_t\|^{2} && \text{(update rule)}\\
    & \leq -\frac{1}{\beta 2}\|\nabla_t\|^{2}.
    \end{aligned}$$

    _Interpretation: we want $\|\nabla_t\|$ to be large for $y_t$ to improve the most._

    This lets us bound
    
    $$\begin{aligned}
    \Phi_{t+1}-\Phi_{t} \leq &
      t(t+1) \cdot\left(f\left(\textcolor{blue}{x_{t}}\right)-f\left(y_{t}\right)\right)\\
      &+2(t+1) \cdot\left(f\left(\textcolor{blue}{x_{t}}\right)-f\left(x^{*}\right)\right)\\
      & +4 \beta\left(\frac{\eta_{t}^{2}}{2}\left\|\nabla_{t}\right\|^{2}+\eta_{t}\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle\right)\\
      &- \textcolor{blue}{(t+2)(t+1) \frac{1}{2 \beta}\left\|\nabla_{t}\right\|^{2}} \\
      \leq &
      t(t+1) \cdot\left(f\left(\textcolor{blue}{x_{t}}\right)-f\left(y_{t}\right)\right)\\
      &+2(t+1) \cdot\left(f\left(\textcolor{blue}{x_{t}}\right)-f\left(x^{*}\right)\right)\\
      & +4 \beta\left(
          \eta_{t}\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle
          \right)\\
      & + \left(4 \beta\frac{\eta_{t}^{2}}{2} - \textcolor{blue}{(t+2)(t+1) \frac{1}{2 \beta}}\right)\left\|\nabla_{t}\right\|^{2} \\
    \end{aligned}$$

    By picking the slow step size to be $\eta_{t}=\frac{t+1}{2 \beta}$ such that the last term disappears this reduces to 

    $$
    \begin{aligned}
    \Phi_{t+1}-\Phi_{t} 
      \leq &
      t(t+1) \cdot\left(f\left(x_{t}\right)-f\left(y_{t}\right)\right)\\
      &+2(t+1) \cdot\left(f\left(x_{t}\right)-f\left(x^{*}\right)\right)\\
      & + 2(t+1)\cdot\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle
          \\
      & - \cancel{\textcolor{blue}{\frac{t+1}{2 \beta}\left\|\nabla_{t}\right\|^{2}}}
      \end{aligned}
    $$

- By convexity

    $$
    \begin{aligned}
    \Phi_{t+1}-\Phi_{t} \leq t &(t+1) \textcolor{blue}{\cdot\left\langle\nabla_{t}, x_{t}-y_{t}\right\rangle} \\
    &+2(t+1) \cdot \textcolor{blue}{\left\langle\nabla_{t}, x_t-x^{*}\right\rangle} \\
    &+2(t+1) \cdot\left\langle\nabla_{t}, x^{*}-z_{t}\right\rangle\\ 
    \leq & (t+1) \cdot\left\langle\nabla_{t},(t+2) x_{t}-t y_{t}-2 z_{t}\right\rangle
    \end{aligned}
    $$

- Using that the update is $x_t=\left(1-\tau_{t}\right) y_{t}+\tau_{t} z_{t}$ we choose the step size $\tau_t$ such that the terms cancels 
    
    $$
    (t+2)\tau_t z_t -2 z_t = 0 \Rightarrow
    \tau_{t}=\frac{2}{t+2}
    $$

    The RHS of the inner product cancels,

    $$
    \Phi_{t+1}-\Phi_{t} \leq 0 \equiv B_t.
    $$

- Now we have a bound for $\Phi_{t+1}-\Phi_{t}$. 
  We directly get from [@eq:phi-sum]

    $$
    f\left(y_{T}\right)-f\left(x^{*}\right) \leq \frac{\Phi_{0}+\sum_{T} B_{t}}{a_{T}} \leq \frac{\Phi_{0}}{a_{T}} \leq 2 \beta \frac{\left\|z_{0}-x^{*}\right\|^{2}}{T(T+1)} \leq \epsilon
    $$

So to be less than $\epsilon$ we have to run for at least $\mathcal O (\frac{1}{\sqrt{\epsilon}})$ iterations.
This is a quadratic speed up over vanilla gradient descent on smooth functions which requires $\mathcal O(\frac{1}{\epsilon})$ steps.

The crucial observation is that we bound $z_t$ in terms of the norm and $y_t$ in terms of the gradient.
This technique is further exploited in [Mirr+Grad paper][2] for general Mirror maps in the aggressive update, $z_t$.

[1]: https://arxiv.org/pdf/1712.04581.pdf
[2]: https://arxiv.org/pdf/1407.1537.pdf
