import { Artwork } from '../types';

export const artworks: Artwork[] = [
  {
    id: '1',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 1503,
    period: 'Renaissance',
    location: {
      country: 'Italy',
      city: 'Florence',
      coordinates: [11.2558, 43.7696]
    },
    imageUrl: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'The world\'s most famous painting, showcasing Renaissance portraiture at its finest.',
    movement: 'High Renaissance',
    medium: 'Oil on poplar'
  },
  {
    id: '2',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: 1889,
    period: 'Post-Impressionism',
    location: {
      country: 'France',
      city: 'Saint-Rémy-de-Provence',
      coordinates: [4.8324, 43.7879]
    },
    imageUrl: 'https://images.pexels.com/photos/1286632/pexels-photo-1286632.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'A masterpiece of swirling night sky over a sleeping village.',
    movement: 'Post-Impressionism',
    medium: 'Oil on canvas'
  },
  {
    id: '3',
    title: 'Guernica',
    artist: 'Pablo Picasso',
    year: 1937,
    period: 'Modern',
    location: {
      country: 'Spain',
      city: 'Madrid',
      coordinates: [-3.7038, 40.4168]
    },
    imageUrl: 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'A powerful anti-war painting depicting the bombing of Guernica.',
    movement: 'Cubism',
    medium: 'Oil on canvas'
  },
  {
    id: '4',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 1831,
    period: 'Edo Period',
    location: {
      country: 'Japan',
      city: 'Tokyo',
      coordinates: [139.6917, 35.6895]
    },
    imageUrl: 'https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Iconic Japanese woodblock print of a massive wave.',
    movement: 'Ukiyo-e',
    medium: 'Woodblock print'
  },
  {
    id: '5',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: 1665,
    period: 'Baroque',
    location: {
      country: 'Netherlands',
      city: 'Delft',
      coordinates: [4.3571, 52.0116]
    },
    imageUrl: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'A captivating portrait known as the "Mona Lisa of the North".',
    movement: 'Dutch Golden Age',
    medium: 'Oil on canvas'
  },
  {
    id: '6',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: 1931,
    period: 'Surrealism',
    location: {
      country: 'Spain',
      city: 'Figueres',
      coordinates: [2.9608, 42.2677]
    },
    imageUrl: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Famous surrealist painting featuring melting clocks.',
    movement: 'Surrealism',
    medium: 'Oil on canvas'
  },
  {
    id: '7',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: 1485,
    period: 'Renaissance',
    location: {
      country: 'Italy',
      city: 'Florence',
      coordinates: [11.2558, 43.7696]
    },
    imageUrl: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Mythological painting depicting the goddess Venus emerging from the sea.',
    movement: 'Early Renaissance',
    medium: 'Tempera on canvas'
  },
  {
    id: '8',
    title: 'American Gothic',
    artist: 'Grant Wood',
    year: 1930,
    period: 'Modern',
    location: {
      country: 'United States',
      city: 'Eldon',
      coordinates: [-92.2129, 40.9175]
    },
    imageUrl: 'https://images.pexels.com/photos/1563354/pexels-photo-1563354.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Iconic American painting of rural Midwestern values.',
    movement: 'American Regionalism',
    medium: 'Oil on beaverboard'
  }
];