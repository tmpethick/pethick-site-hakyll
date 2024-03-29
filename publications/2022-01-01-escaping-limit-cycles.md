-----
title: "Escaping limit cycles: Global convergence for constrained nonconvex-nonconcave minimax problems"
authors: Thomas Pethick, Puya Latafat, Panagiotis Patrinos, Olivier Fercoq, Volkan Cevher
conference: The International Conference on Learning Representations (ICLR) 2022
paper: https://infoscience.epfl.ch/record/291889/files/escaping_limit_cycles_global_c.pdf
code: https://github.com/LIONS-EPFL/weak-minty-code/
-----

This paper introduces a new extragradient-type algorithm for a class of nonconvex-nonconcave minimax problems. It is well-known that finding a local solution for general minimax problems is computationally intractable. This observation has recently motivated the study of structures sufficient for convergence of first order methods in the more general setting of variational inequalities when the so-called weak Minty variational inequality (MVI) holds. This problem class captures non-trivial structures as we demonstrate with examples, for which a large family of existing algorithms provably converge to limit cycles. Our results require a less restrictive parameter range in the weak MVI compared to what is previously known, thus extending the applicability of our scheme. The proposed algorithm is applicable to constrained and regularized problems, and involves an adaptive stepsize allowing for potentially larger stepsizes. Our scheme also converges globally even in settings where the underlying operator exhibits limit cycles. Moreover, a variant with stochastic oracles is proposed---making it directly relevant for training of generative adversarial networks. For the stochastic algorithm only one of the stepsizes is required to be diminishing while the other may remain constant, making it interesting even in the monotone setting.

