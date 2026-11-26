/** L'heure, derrière une interface : les tests peuvent la fixer et l'avancer à volonté. */
export interface Clock {
  now(): Date
}
