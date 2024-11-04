'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import ContentTop from '@/components/shared/ContentTop'
import Text from '@/components/shared/Text'
import Flex from '@/components/shared/Flex'
import ProfileBox from '@/components/shared/ProfileBox'
import ImageBox from '@/components/shared/ImageBox'
import MatchList from '@/components/matches/MatchList'

interface SummonerProps {
  summonerName: string
  summonerPuuid: string
  summonerTag: string
  summonerLevel: number | null
  summonerIconId: number | null
}

const Summoner = () => {
  const { id } = useParams() // 경로 파라미터에서 'id'를 가져옴
  const [isError, setIsError] = useState<string>('')
  const [summonerInfo, setSummonerInfo] = useState<SummonerProps>({
    //소환사 정보(이름,태그,puuid)
    summonerName: '',
    summonerPuuid: '',
    summonerTag: '',
    summonerLevel: null,
    summonerIconId: null,
  })

  const [summonerGameRecord, setSummonerGameRecord] = useState([]) //소환사 게임 정보

  const fetchSummonerInfo = async () => {
    //소환사 레벨과 아이콘 정보를 가져오는 함수
    try {
      const response = await axios.get(
        `/api/summoners/by-puuid/?puuid=${summonerInfo.summonerPuuid}`,
      )

      setSummonerInfo((prev) => ({
        ...prev, //이전 정보에서 3개만 수정
        summonerLevel: response.data.summonerLevel,
        summonerIconId: response.data.profileIconId,
      }))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error)
      }

      console.log(error)
    }
  }

  const fetchMatchData = async () => {
    try {
      const matchResponse = await axios.get(
        `/api/match/matches/?puuid=${summonerInfo.summonerPuuid}`,
      )

      setSummonerGameRecord(matchResponse.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error)
      }

      console.log(error)
    }
  }

  useEffect(() => {
    if (id) {
      //id는 string
      const [gameName, tagLine] = (id as string).split('-')

      //유저의 닉네임과 태그를 추출해서 api를 요청
      const fetchSummoner = async () => {
        try {
          const response = await axios.get(
            `/api/account/by-riot-id/?gameName=${gameName}&tagLine=${tagLine}`,
          )
          setSummonerInfo((prev) => ({
            ...prev, //이전 정보에서 3개만 수정
            summonerName: response.data.gameName,
            summonerPuuid: response.data.puuid,
            summonerTag: response.data.tagLine,
          }))
        } catch (error: unknown) {
          //axios 에러인지 확인
          if (axios.isAxiosError(error)) {
            if (error.status === 404) {
              //404에러(요청하는 닉네임과 태그를 가진 소환사가 없다면) 메세지 넣기
              setIsError(error.response?.data.message)
            }
          } else {
            console.log(error)
          }
        }
      }

      fetchSummoner()
    }
  }, [id])

  //puuid로 데이터(아이콘 정보, 레벨) 추가
  useEffect(() => {
    if (summonerInfo.summonerPuuid) {
      fetchSummonerInfo()
      fetchMatchData()
    }
  }, [summonerInfo.summonerPuuid])

  useEffect(() => {
    console.log(summonerGameRecord)
  }, [summonerGameRecord])

  if (isError.length > 0) {
    //에러시 메세지 출력
    return <div>{isError}</div>
  }

  return (
    <>
      <ContentTop>
        <Flex align="end" className="gap-[10px]">
          <ProfileBox size="medium">
            <ImageBox
              src={`http://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summonerInfo.summonerIconId}.png`}
            />
            <Text
              size="t1"
              className="px-[5px] py-[3px] absolute right-[5px] bottom-[5px] bg-[#000] rounded-[3px]"
            >
              {summonerInfo.summonerLevel}
            </Text>
          </ProfileBox>
          {summonerInfo?.summonerName && (
            <Flex align="end" className="gap-[5px]">
              <Text size="t3" weight="bold" className="mr-[5px]">
                {summonerInfo?.summonerName}
              </Text>
              <Text size="t2" weight="light">
                #{summonerInfo?.summonerTag}
              </Text>
            </Flex>
          )}
        </Flex>
      </ContentTop>

      <MatchList matchList={summonerGameRecord} />
    </>
  )
}

export default Summoner
