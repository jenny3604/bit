import { BitError } from '@teambit/bit-error';
import { InvalidScopeName, isValidScopeName } from '@teambit/legacy-bit-id';
import { MainRuntime } from '@teambit/cli';
import { composeComponentPath } from '@teambit/legacy/dist/utils/bit/compose-component-path';
import { Component } from '@teambit/component';
import { ComponentID } from '@teambit/component-id';
import { Harmony } from '@teambit/harmony';
import { PathLinuxRelative } from '@teambit/legacy/dist/utils/path';
import WorkspaceAspect, { Workspace } from '@teambit/workspace';
import { NewComponentHelperAspect } from './new-component-helper.aspect';

export class NewComponentHelperMain {
  constructor(private workspace: Workspace, private harmony: Harmony) {}
  /**
   * when creating/forking a component, the user provides the new name and optionally the scope/namespace.
   * from this user input, create a ComponentID.
   */
  getNewComponentId(name: string, namespace?: string, scope?: string): ComponentID {
    scope = scope || this.workspace.defaultScope;
    if (!isValidScopeName(scope)) {
      throw new InvalidScopeName(scope);
    }
    if (!scope) throw new BitError(`failed finding defaultScope`);

    const fullComponentName = namespace ? `${namespace}/${name}` : name;
    return ComponentID.fromObject({ name: fullComponentName }, scope);
  }

  /**
   * when creating/forking a component, the user may or may not provide a path.
   * if not provided, generate the path based on the component-id.
   * the component will be written to that path.
   */
  getNewComponentPath(componentId: ComponentID, pathFromUser?: string): PathLinuxRelative {
    if (pathFromUser) return pathFromUser;
    return composeComponentPath(componentId._legacy.changeScope(componentId.scope), this.workspace.defaultDirectory);
  }

  async writeAndAddNewComp(
    comp: Component,
    targetPath: string,
    targetId: ComponentID,
    config?: { [aspectName: string]: any }
  ) {
    await this.workspace.write(targetPath, comp);
    await this.workspace.track({
      rootDir: targetPath,
      componentName: targetId.fullName,
      mainFile: comp.state._consumer.mainFile,
      config,
    });
    await this.workspace.bitMap.write();
    this.workspace.clearCache();
    // this takes care of compiling the component as well
    await this.workspace.triggerOnComponentAdd(targetId);
  }

  async getConfigFromExistingToNewComponent(comp: Component) {
    const aspectIds = comp.state.aspects.entries.map((e) => e.id.toString());
    await this.workspace.loadAspects(aspectIds);
    const fromExisting = {};
    comp.state.aspects.entries.forEach((entry) => {
      if (!entry.config) return;
      const aspectId = entry.id.toString();
      const aspect = this.harmony.get<CloneConfig>(aspectId);
      if (!aspect) throw new Error(`error: unable to get "${aspectId}" aspect from Harmony`);
      if (
        'shouldPreserveConfigForClonedComponent' in aspect &&
        aspect.shouldPreserveConfigForClonedComponent === false
      ) {
        return;
      }
      fromExisting[aspectId] = entry.config;
    });
    return fromExisting;
  }

  static slots = [];
  static dependencies = [WorkspaceAspect];
  static runtime = MainRuntime;
  static async provider([workspace]: [Workspace], config, _, harmony: Harmony) {
    return new NewComponentHelperMain(workspace, harmony);
  }
}

NewComponentHelperAspect.addRuntime(NewComponentHelperMain);

export interface CloneConfig {
  readonly shouldPreserveConfigForClonedComponent?: boolean; // default true
}
