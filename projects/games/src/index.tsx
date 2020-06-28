import { Remote } from 'comlink';

import { OptimizerTypes } from './runner';
import { inView, runWhenInViewport } from './viewport';
import { GamePlot } from './GamePlot';
import { Storage } from './Storage';

import './styles/index.scss';


const loadFromState = (selector, state, uri, displaySetting={'interactive': true, 'showAxes': true}) => {
  // Get state from URI if there
  const storage = new Storage();
  let urlState = null;
  if (uri) {
    try {
      urlState = storage.read(uri);
    } catch(err) {
      console.log(err);
    }
    if (urlState != null) {
      const [loadedState, trajectories] = urlState;
      const gp = new GamePlot(loadedState, storage, displaySetting);
      gp.render(selector);
    
      const element = document.querySelector(selector);
      runWhenInViewport(element, () => gp.drawTrajectories(trajectories));
      return;
    }  
  }

  const gp = new GamePlot(state, storage, displaySetting);
  gp.render(selector);
}

const uri = window.location.search.substr(1); // remove "?"
loadFromState('#contour-top', {
  gameType: "unstableGame",
  lr: 0.01,
  optimizerTypes: Object.values(OptimizerTypes)
}, uri);

loadFromState('#contour-nash-eq', {
  gameType: "bilinear",
  lr: 0.01,
  optimizerTypes: Object.values(OptimizerTypes)
}, null, {'interactive': false, 'showAxes': false});

loadFromState('#contour-bilinear', {
  gameType: "bilinear",
  lr: 0.01,
  optimizerTypes: Object.values(OptimizerTypes)
}, 'N4Ig5ghgtgpgKgTwA4xALhAIwJYBtsB2MEATiADQi5loAMAdLQIyUD2SALtlNgF4wlEKAM7oA2iADKAcQAiIALoBfAD5jQrdFLkUQACy0MArEwCc5ALQMAbAHYALOWNGAHJZv2WN2gCZ39a1paJwD7AGZ-IyNbELsjSKYYhltaeKt6e1t45LCY9PsfbPpbazSGXL9k02D0sMSQl1o8hh9rcwYXQv8fJkr6FzC3dKYjRw7M-1pTIpcjP3TaMJm5kN8x-vt2xiyGgpCmJYawiIYmWYazkJ9whsWr0y9il0ew+2sQrKL7II+uhnsVjZTH0jMxYtZHqM+tYfCCXO9jPDYrCQqNHtYYSFNicAqY3P8TL8EfQwqYtp8Qq8irZnvdgh07i1jg0evsdh1Dqc-ht1rQMQ1Qas+QL5gxUjjZjVTgddo5htYJWF3ukehLrt0UrdmiTLskXOZarYcSUyhlWh8lf5MsSUqaTPiAjt0kZrOsFcrvEl6EZpv5XSDXH7GqimCx0iktm8DclPFjLuHrA6laaaVs6tH+kx6fRWhF0p11qr-AMvSNTS43qtTB7+oSxbliysFj48x1BQsHMWbsNmfmwqL6GYB88a9cM40pTm8f5bDT-EtW8VCflheHWflA+lE0NjE0-S7IhMt-VncDIsGtz5tUZDlv+fkXDvir4rQCZz4M6TF1kn8cMzS5RaB5izuFVbw6ddTlnYtwMHeNxlNVJx2XMVaCfWY+loexANrR4s0XCtiRGHCBgdHph25Vpxz3coTyqbMKhnUosXVcMG3+RMZyzENtTiVEFT9diAlXYxq1iWNnR9WJbAzEw+hSJ9MmzBxJwKZTONqOwPn1ecfGzRoM1adZOlHYUOW1EYvUIyZpzbMN6wdDDVhRcYtjQx4Kzw74jmzMwtmeL1rgdGSk1SD453KQEl2JUlgqvLFNliMksTPGwBOMbybHVRF1lcdFzWMS00q+HTkjBf5SQtHFSXWH9KUyp4cQ-CUXyZYlOl8iL+lefYzF2Io+X0utGB+NsBz5RzEuGeLxgHM52rqbobg6JgazCUbijE2oonCxdvmCyt8kCD5VsiKZYlpSSildHDAiKH1eMrZxF0THFQRrWx6gJbUHAdb4Ps7SLhw2nwdPzPqmWHZkoPLbDeprSVVgPfMm1Qgj2zFAT8zh6aoZws57P6PTukq-MwRVX1wxk+cUKXPasPfPbkZsMHd1NUpFyiAcIU5rbjE1LcG2dVibCdf4Si41SunDCTymYqmBzqScZNHUZixGfwzARxae3QvYOz1jNmGQzDZdw-YfmxoipL7QLzXzVkWgGEDqsGGdaXKM9wx2-4ceSblNlu1LvXsJ9SmzH1ue4mweudLTRYHOZHhSbVMmNUn-hc4otM08lgNqJhjLQ7p+Qg009P8t3hmGittSmPpZkJrCPKi42BWzJp9OWwcPyOPozkc4mmSs1qp1q6nykS5IbyxRlihbLE1aBL5TC9UotlGN0h+9Uqd5xGF7rdtL1k2dFkt95P+0pXeShebuaT6UGR8LdaWX7j3uvWXoG7hzGJUFMUvQRSTFDgKQmWYrJvmro5IWLRToQUXFeFqa1HZPF-BLZIWNM7BVgpkckoFjAzQCDnYwpcAix28BvUwL1f7eh2luDB3oNbhlDFiEhxQ9j-FOlTBiWDNoMW4StR4rRJydCKD0URR9Byow2F6KY6NMIUNrONe2rlJhImxuAqBHJwGUxWuXGRMlPzk2SBLbaH0MYZHOmuVSx0tz513C9OxGUXrE2dI+SIc5LyyQzsQvayV7E4Wwv+eKtRpzezWn7J4A4PwIxMTmby4MMxmEkXNK+2NFxNHRpOZgCjVhHjshbBGb5Tjyw5OI5hEFCy2GBjFUG7sii5BwiUE+oScjEkyE+FIuU+oMLemU8h10Xxbg2q6TmB4WaExMMpbiR0DqE08F6Eon5XQfGofOc6K1EEzwgtqPSipkklNkTZYyMjFjLEwvAjYblGEVi-kQgYOIzgzF1AklqDENo0gYhMaeJ9PkByim0EEo8MSQk4QEIhrgI7nCym9H5AQJnelGesgkcVHj-Q+MNJUydAYkjMptQKU9MzEj0vpV+pxYzjEeGhH+blFpjUmPUhlHZ-KgJ7KyycZgrL1JVE9TM5dfRVF-AA4oYsSRiWnntUB-t-FnztFI0oT5XD716TYCGe99wbyrsvFKysF6+x+js8VAMYqWKMfcEiX0czau6r5Dx2NfI2orA6JoJtViquUSA0RbKxQOI2JyyxnRDLxOeDhQoXTTA4TqM0zsmlCYOFToXd8CzNxAk5pbGwzMQ68RRO4msUK-Q8sKuze8-xI1+lXlaQx0t-gZqXKaV4H1LpAWopOa4w54KDnWX2cBSiKzjQrF2I2ItPVijaaOxgLhtTOv2LAjYeE+ZEy2IUAiMpyjDKqKan6NS4zKyOQCZp6rNg1jaBHKJpRcr2rVW6V+zpPrgk5lfIEGZQ61XSRVWqWbBjkmprUbujRCag0cnRa1lc5ofwrIub+7dJjpU9QsIBhSxTSo2ERGi3UtgjEHmRdDzxH7MSqC8VBs4XicRjK0mZXo3hug8buYkpRIRGohJCSt-NrpPu9L3UW6LaPPnRVIo01UkSYL6MceSU6riDoZOIoqRNOowKKKGVlA0yO1g7lapyCx-20yzD-Gsq0PKWhVKwsuJdHLF1qBxmk9Nk6WLeEs1hwstgYjtBJtV7MGpRAzK9VEIl54dP1pg9YuQUyCrxeWK11xJGKdLcc31ojW4yhRk3eh4woM6w5Jy8JDJDI7vDJ0ec3YYyKSAeGax4teJ8JvN50rol83RD9D6jIi62imnCP+Xs5Q8uYOMfGgJLRe4OzmmrPsRsvFqIQwlnwIAlAKCAA');

loadFromState('#contour-stable', {
  gameType: "stableGame",
  lr: 0.03,
  optimizerTypes: Object.values(OptimizerTypes)
});

loadFromState('#contour-unstable', {
  gameType: "unstableGame",
  lr: 0.03,
  optimizerTypes: Object.values(OptimizerTypes)
});


loadFromState('#contour-wild', {
  gameType: "unstableGame",
  lr: 0.3,
  optimizerTypes: OptimizerTypes.SGD
});

