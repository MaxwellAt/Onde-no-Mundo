import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  const mockCountries = [
    {
      name: 'Brazil',
      nativeName: 'Brasil',
      alpha3Code: 'BRA',
      region: 'Americas',
      capital: 'Brasília',
      population: 210147125,
      topLevelDomain: ['.br'],
      currencies: [{ code: 'BRL' }],
      languages: [{ name: 'Portuguese' }],
      borders: ['ARG', 'URY'],
      flags: { png: 'https://example.com/bra.png', svg: 'https://example.com/bra.svg' },
    },
  ];

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockCountries,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renderiza o header do app', async () => {
  render(<App />);
  expect(screen.getByText(/where in the world\?/i)).toBeInTheDocument();
  expect(await screen.findByPlaceholderText(/search for a country/i)).toBeInTheDocument();
  expect(await screen.findByText('Brazil')).toBeInTheDocument();
});
