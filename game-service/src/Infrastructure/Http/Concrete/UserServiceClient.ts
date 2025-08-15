import {IUserServiceClient} from "../Interface/IUserServiceClient";
import axios from 'axios';
import {GetUserMatchmakingQueryDTO} from "../../../Domain/QueryDTO/GetUserMatchmakingQueryDTO";
import {UpdateStatsExternalDTO} from "../../../Domain/ExternalDTO/UpdateStatsExternalDTO";
import { stringify } from 'qs';

export class UserServiceClient implements IUserServiceClient
{
    private readonly baseUrl: string;

    constructor()
    {
        //Pode ser que seja 127.0.0.1:8080 (local é isso)
        this.baseUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    }

    public async VerifyIfUsersExistsByUsername(usernames: (string | null)[]): Promise<any> {
    try {
        const validUsernames = usernames.filter(u => u != null && u !== '');

        if (validUsernames.length === 0) {
            return false;
        }

        const response = await axios.get(`${this.baseUrl}/users/exists/usernames`, {
            params: { usernames: validUsernames },
            paramsSerializer: params => stringify(params, { arrayFormat: 'repeat' }),
        });

        return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
                return false;
            }
            throw error;
        }
    }

    public async VerifyIfUserExistsByUuid(uuid: string): Promise<any>
    {
        try
        {
            const response = await axios.get(`${this.baseUrl}/users/:${uuid}`, {
                params: { uuid: uuid }
            });

            return response.data;
        }
        catch (error)
        {
            if (axios.isAxiosError(error) && error.response?.status === 404)
                return false;

            throw error;
        }
    }

    public async VerifyIfUsersExistsByUuids(uuids: (string | null)[]): Promise<any>
    {
        try
        {
            const validUuids = uuids.filter(user => user != null && user != '');

            if (validUuids.length === 0)
                return false;

            const response = await axios.get( `${this.baseUrl}/users/exists/uuids`, {
                params: { uuids: validUuids },
                paramsSerializer: params => stringify(params, { arrayFormat: 'repeat' })
            });
            return response.data;
        }
        catch (error)
        {
            if (axios.isAxiosError(error) && error.response?.status === 404)
                return false;
            throw error;
        }
    }

    public async VerifyIfUserExistsByUsername(username: string): Promise<any>
    {
        try
        {
            const response = await axios.get(`${this.baseUrl}/users/:${username}`, {
                params: { username: username }
            });

            return response.data;
        }
        catch (error)
        {
            if (axios.isAxiosError(error) && error.response?.status === 404)
                return false;

            throw error;
        }
    }

    public async UpdateStatsForUsers(updateStatsExternalDTO: UpdateStatsExternalDTO): Promise<any>
    {
        try
        {
            const response = await axios.put(`${this.baseUrl}/updateStats`, updateStatsExternalDTO);
            return response.data;
        }
        catch (error)
        {
            if (axios.isAxiosError(error) && error.response?.status === 404)
                return false;

            throw error;
        }
    }

    public async SearchForOpponent(username: string, wins: number, totalGames: number) : Promise<GetUserMatchmakingQueryDTO | null>
    {
        try
        {
            const response = await axios.get(`${this.baseUrl}/matchmaking`, {
                params: {username: username, wins: wins, totalGames: totalGames}
            });

            if (response.status !== 200)
                return null;
            return response.data;
        }
        catch (error)
        {
            if (axios.isAxiosError(error) && error.response?.status === 404)
                return null;

            throw error;
        }
    }
}