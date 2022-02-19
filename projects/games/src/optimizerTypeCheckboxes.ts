import * as d3 from 'd3';
import { uuidv4 } from './uuid';
import { OptimizerTypes } from './runner';


export const colors = {
  [OptimizerTypes.Adam]: 'red',
  [OptimizerTypes.SGD]: 'blue',
  [OptimizerTypes.Momentum]: 'orange',
};


export const optimizerTypeNames = {
  [OptimizerTypes.Adam]: 'Adam',
  [OptimizerTypes.SGD]: 'GD',
  [OptimizerTypes.Momentum]: 'Momentum',
};


export function optimizerTypeCheckboxes(active: OptimizerTypes[], onChange) {
  let activeList = active;
  const checkboxes = d3.create('div')
    .attr('class', 'optimizertype-checkboxes');
  Object.keys(OptimizerTypes).forEach((type: OptimizerTypes) => {
    const id_ = `${uuidv4()}-optimizer-type-${type}`;
    let container = checkboxes.append('div');
    let checkbox = container
      .append('input')
      .attr('type', 'checkbox')
      .attr('id', id_)
      .attr('value', type)
      .style('background-color', colors[type])
      .property('checked', active.includes(type))
      .on('change', function () {
        if (this.checked) {
          const v: OptimizerTypes = this.value;
          activeList.push(v);
        }
        else {
          activeList = activeList.filter(v => v != this.value);
        }
        onChange(activeList);
      });
    let label = container
      .append('label')
      .attr('for', id_)
      .text(optimizerTypeNames[type]);
  });
  return checkboxes;
}
