import type {
  DefaultSharedCoreModuleContext,
  LangiumCoreServices,
  LangiumSharedCoreServices,
  Module,
  PartialLangiumCoreServices,
} from 'langium';
import {
  EmptyFileSystem,
  createDefaultCoreModule,
  createDefaultSharedCoreModule,
  inject,
} from 'langium';

import { CommonValueConverter } from '../common/valueConverter.js';
import { MermaidGeneratedSharedModule, PacketGeneratedModule } from '../generated/module.js';
import { PacketTokenBuilder } from './tokenBuilder.js';

/**
 * Declaration of `Packet` services.
 */
interface PacketAddedServices {
  parser: {
    TokenBuilder: PacketTokenBuilder;
    ValueConverter: CommonValueConverter;
  };
}

/**
 * Union of Langium default services and `Packet` services.
 */
export type PacketServices = LangiumCoreServices & PacketAddedServices;

/**
 * Dependency injection module that overrides Langium default services and
 * contributes the declared `Packet` services.
 */
export const PacketModule: Module<
  PacketServices,
  PartialLangiumCoreServices & PacketAddedServices
> = {
  parser: {
    TokenBuilder: () => new PacketTokenBuilder(),
    ValueConverter: () => new CommonValueConverter(),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 * @param context - Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createPacketServices(context: DefaultSharedCoreModuleContext = EmptyFileSystem): {
  shared: LangiumSharedCoreServices;
  Packet: PacketServices;
} {
  const shared: LangiumSharedCoreServices = inject(
    createDefaultSharedCoreModule(context),
    MermaidGeneratedSharedModule
  );
  const Packet: PacketServices = inject(
    createDefaultCoreModule({ shared }),
    PacketGeneratedModule,
    PacketModule
  );
  shared.ServiceRegistry.register(Packet);
  return { shared, Packet };
}
