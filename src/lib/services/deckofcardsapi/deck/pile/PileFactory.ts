import DeckEndpoint from "../Deck";
import PileEndpoint from "./Pile";


export default class PileFactory {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    pile = Object.assign(
        (pileName: string) => {
            return new PileEndpoint(this.url, pileName);
        },
        {
            new: async (pileName: string) => {
                return await PileEndpoint.new(this.url, pileName);
            }      
        }
    )
}