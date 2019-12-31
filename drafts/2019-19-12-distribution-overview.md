

# NLP

## Unigram

$$P\left(\left\{x_{i}\right\} | \sum_{i} x_{i}=l\right)=\frac{l !}{\prod_{i} x_{i} !} \prod_{i}\left(\frac{w_{i}}{\sum_{i} w_{i}}\right)^{x_{i}}$$

Assumes:
- Words are sampled with some frequency independent of all other frequency.

Notes: 
- It allows you to sample words based on the frequency with which they occur.
- The tricky part when sampling a document of fixed length is that _it makes the sampled dependent_[^1].
- Usually raised to a power in NLP to smoothing the distribution (TODO: illustrate effect on the distribution).

[^1]: here the Poisson trick comes in handy no?

Code:
```python
# generate sample
```
