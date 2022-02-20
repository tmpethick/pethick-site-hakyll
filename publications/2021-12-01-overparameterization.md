-----
title: "Subquadratic Overparameterization for Shallow Neural Networks"
authors: Chaehwan Song, Ali Ramezani-Kebrya, Thomas Pethick, Armin Eftekhari, Volkan Cevher
conference: Neural Information Processing Systems (NeurIPS) 2021
paper: https://infoscience.epfl.ch/record/289650/files/OverpararXiv%281%29.pdf
code: https://github.com/LIONS-EPFL/Subquadratic-Overparameterization
-----

Overparameterization refers to the important phenomenon where the width of a neural network is chosen such that learning algorithms can provably attain zero loss in nonconvex training. The existing theory establishes such global convergence using various initialization strategies, training modifications, and width scalings. In particular, the state-of-the-art results require the width to scale quadratically with the number of training data under standard initialization strategies used in practice for best generalization performance. In contrast, the most recent results obtain linear scaling either with requiring initializations that lead to the “lazy-training”, or training only a single layer. In this work, we provide an analytical framework that allows us to adopt standard initialization strategies, possibly avoid lazy training, and train all layers simultaneously in basic shallow neural networks while attaining a desirable subquadratic scaling on the network width. We achieve the desiderata via Polyak-Łojasiewicz condition, smoothness, and standard assumptions on data, and use tools from random matrix theory.
