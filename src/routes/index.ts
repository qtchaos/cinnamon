import { version } from '../../package.json';

export default eventHandler((event) => {
  setResponseHeader(event, 'X-Author', 'qtchaos');
  setResponseHeader(event, 'X-Version', version);
  setResponseHeader(
    event,
    'X-Repository',
    'https://github.com/qtchaos/cinnamon',
  );
  return { cinnamon: version };
});
