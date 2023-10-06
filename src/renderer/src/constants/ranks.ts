const RANKS = [
  { minimumRating: 0, rankSlug: 'Bronze 1' },
  { minimumRating: 766, rankSlug: 'Bronze 2' },
  { minimumRating: 914, rankSlug: 'Bronze 3' },
  { minimumRating: 1055, rankSlug: 'Silver 1' },
  { minimumRating: 1189, rankSlug: 'Silver 2' },
  { minimumRating: 1316, rankSlug: 'Silver 3' },
  { minimumRating: 1436, rankSlug: 'Gold 1' },
  { minimumRating: 1549, rankSlug: 'Gold 2' },
  { minimumRating: 1654, rankSlug: 'Gold 3' },
  { minimumRating: 1752, rankSlug: 'Platinum 1' },
  { minimumRating: 1843, rankSlug: 'Platinum 2' },
  { minimumRating: 1928, rankSlug: 'Platinum 3' },
  { minimumRating: 2004, rankSlug: 'Diamond 1' },
  { minimumRating: 2074, rankSlug: 'Diamond 2' },
  { minimumRating: 2137, rankSlug: 'Diamond 3' },
  { minimumRating: 2192, rankSlug: 'Master 1' },
  { minimumRating: 2275, rankSlug: 'Master 2' },
  { minimumRating: 2350, rankSlug: 'Grandmaster' }
]

export const getRank = (rating: number) => {
  const ranks = RANKS.filter((rank) => rank.minimumRating <= rating)
  const rank = ranks.reduce((a, b) => (a.minimumRating > b.minimumRating ? a : b))
  return rank?.rankSlug || RANKS[0].rankSlug
}
