import { InjectionKey } from 'vue';
import { Client } from './client';

export const VILLUS_CLIENT: InjectionKey<Client> = Symbol('villus.client');
