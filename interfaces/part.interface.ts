interface IPartProperty extends IProperty {
    showInLabel: boolean;
}

interface IPartLayer {
    id: string;
    sticky: boolean;
}

interface IPartViewSettings {
    name: string;
    image: string;
    layers: IPartLayer[];
    flipHorizontal: boolean;
    flipVertical: boolean;
}
