// Une planche : le dessin d'un passage. Elle rend null quand le script ne lui donne plus ce qu'elle attend
// (un nombre, un mot) : le passage prend alors le dessin générique de sa sorte d'image.

import type { JSX } from 'preact'
import type { P } from '../dessin/encre'

export type Board = (p: P) => JSX.Element | null
