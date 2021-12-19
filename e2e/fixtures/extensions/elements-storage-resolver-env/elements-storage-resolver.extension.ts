import { EnvsMain, EnvsAspect } from '@teambit/envs';
import { ReactAspect, ReactMain } from '@teambit/react';
import ReactElementsAspect, { ReactElementsMain } from "@teambit/react-elements";
import { WebpackAspect, WebpackMain } from '@teambit/webpack';

import {ElementsStorageResolverEnv} from './elements-storage-resolver.env';

export class ElementsStorageResolverMain {
  static dependencies: any = [EnvsAspect, ReactAspect, WebpackAspect, ReactElementsAspect];

  static async provider([envs, react, webpack, reactElements]: [EnvsMain, ReactMain, WebpackMain, ReactElementsMain]) {
    const myReactElementsEnv: ElementsStorageResolverEnv = envs.merge(
      new ElementsStorageResolverEnv(reactElements, webpack, react),
      react.reactEnv
    );
    envs.registerEnv(myReactElementsEnv);
    return new ElementsStorageResolverMain();
  }
}
