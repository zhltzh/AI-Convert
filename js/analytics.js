const analyticsToken = 'b74d0b00809942c78c8edb9c7acb6cc2';

if (!document.querySelector('script[data-cf-beacon]')) {
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token: analyticsToken });
  document.head.append(beacon);
}
