#!/usr/bin/env python3
"""
Advanced Voice Processor - Revolutionary Voice Actor Capabilities
Professional voice synthesis, emotion analysis, and character development
"""

import os
import json
import asyncio
import requests
import numpy as np
import soundfile as sf
import librosa
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
import io
import base64

logger = logging.getLogger(__name__)

@dataclass
class VoiceCharacter:
    name: str
    personality: Dict[str, Any]
    voice_id: str
    emotion_profile: Dict[str, float]
    speaking_style: str
    language: str = "en"

class AdvancedVoiceProcessor:
    """Advanced voice processing with professional voice actor capabilities"""
    
    def __init__(self, elevenlabs_api_key: str):
        self.elevenlabs_api_key = elevenlabs_api_key
        self.characters = {}
        self.voice_cache = {}
        self.emotion_analyzer = self._init_emotion_analyzer()
        
    def _init_emotion_analyzer(self):
        """Initialize emotion analysis system"""
        return {
            "emotions": ["happy", "sad", "angry", "calm", "excited", "professional", "friendly", "serious"],
            "intensity_levels": ["low", "medium", "high"],
            "voice_mapping": {
                "happy": {"pitch_shift": 2, "speed": 1.1, "energy": 1.2},
                "sad": {"pitch_shift": -2, "speed": 0.9, "energy": 0.8},
                "angry": {"pitch_shift": 3, "speed": 1.2, "energy": 1.4},
                "calm": {"pitch_shift": -1, "speed": 0.95, "energy": 0.9},
                "excited": {"pitch_shift": 4, "speed": 1.3, "energy": 1.5},
                "professional": {"pitch_shift": 0, "speed": 1.0, "energy": 1.0},
                "friendly": {"pitch_shift": 1, "speed": 1.05, "energy": 1.1},
                "serious": {"pitch_shift": -1, "speed": 0.9, "energy": 0.95}
            }
        }
    
    async def synthesize_voice(self, text: str, voice_id: str, emotion: str = "neutral", 
                             speed: float = 1.0, pitch: float = 0) -> bytes:
        """Synthesize voice with emotional expression"""
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            # Apply emotion-based voice settings
            emotion_settings = self.emotion_analyzer["voice_mapping"].get(emotion, {})
            adjusted_speed = speed * emotion_settings.get("speed", 1.0)
            adjusted_pitch = pitch + emotion_settings.get("pitch_shift", 0)
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                return response.content
            else:
                raise Exception(f"Voice synthesis failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Voice synthesis error: {e}")
            raise
    
    def create_character(self, name: str, personality: Dict[str, Any], 
                        voice_id: str, language: str = "en") -> VoiceCharacter:
        """Create a new voice character with personality"""
        character = VoiceCharacter(
            name=name,
            personality=personality,
            voice_id=voice_id,
            emotion_profile=self._analyze_personality_emotions(personality),
            speaking_style=personality.get("speaking_style", "neutral"),
            language=language
        )
        
        self.characters[name] = character
        return character
    
    def _analyze_personality_emotions(self, personality: Dict[str, Any]) -> Dict[str, float]:
        """Analyze personality traits to determine emotion profile"""
        traits = personality.get("traits", [])
        emotion_profile = {
            "happy": 0.5,
            "sad": 0.5,
            "angry": 0.5,
            "calm": 0.5,
            "excited": 0.5,
            "professional": 0.5,
            "friendly": 0.5,
            "serious": 0.5
        }
        
        # Map personality traits to emotions
        trait_emotion_mapping = {
            "intelligent": {"professional": 0.8, "serious": 0.7},
            "friendly": {"friendly": 0.9, "happy": 0.7},
            "energetic": {"excited": 0.9, "happy": 0.8},
            "serious": {"serious": 0.9, "professional": 0.8},
            "calm": {"calm": 0.9, "professional": 0.7},
            "enthusiastic": {"excited": 0.8, "happy": 0.8},
            "helpful": {"friendly": 0.8, "professional": 0.7}
        }
        
        for trait in traits:
            if trait in trait_emotion_mapping:
                for emotion, value in trait_emotion_mapping[trait].items():
                    emotion_profile[emotion] = max(emotion_profile[emotion], value)
        
        return emotion_profile
    
    async def speak_as_character(self, character_name: str, dialogue: str, 
                               emotion: Optional[str] = None) -> bytes:
        """Generate speech in character's voice with appropriate emotion"""
        if character_name not in self.characters:
            raise ValueError(f"Character '{character_name}' not found")
        
        character = self.characters[character_name]
        
        # Determine emotion if not specified
        if emotion is None:
            emotion = self._detect_emotion_from_text(dialogue)
        
        # Adjust emotion based on character's personality
        adjusted_emotion = self._adjust_emotion_for_character(character, emotion)
        
        return await self.synthesize_voice(
            text=dialogue,
            voice_id=character.voice_id,
            emotion=adjusted_emotion
        )
    
    def _detect_emotion_from_text(self, text: str) -> str:
        """Detect emotion from text content"""
        text_lower = text.lower()
        
        # Simple emotion detection based on keywords
        emotion_keywords = {
            "happy": ["happy", "joy", "excited", "great", "wonderful", "amazing"],
            "sad": ["sad", "sorry", "unfortunate", "disappointing", "regret"],
            "angry": ["angry", "furious", "mad", "upset", "annoyed"],
            "excited": ["excited", "thrilled", "amazing", "incredible", "fantastic"],
            "professional": ["analysis", "report", "data", "research", "study"],
            "friendly": ["hello", "greetings", "welcome", "nice", "pleasure"]
        }
        
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion
        
        return "neutral"
    
    def _adjust_emotion_for_character(self, character: VoiceCharacter, emotion: str) -> str:
        """Adjust emotion based on character's personality"""
        emotion_profile = character.emotion_profile
        
        # If character has high affinity for this emotion, use it
        if emotion_profile.get(emotion, 0) > 0.7:
            return emotion
        
        # Otherwise, find the character's strongest emotion
        strongest_emotion = max(emotion_profile.items(), key=lambda x: x[1])[0]
        return strongest_emotion
    
    async def create_conversation(self, characters: List[str], dialogue: List[str]) -> List[bytes]:
        """Create a multi-character conversation"""
        if len(characters) != len(dialogue):
            raise ValueError("Number of characters must match number of dialogue lines")
        
        audio_segments = []
        
        for char_name, line in zip(characters, dialogue):
            audio = await self.speak_as_character(char_name, line)
            audio_segments.append(audio)
        
        return audio_segments
    
    def get_available_characters(self) -> List[str]:
        """Get list of available character names"""
        return list(self.characters.keys())
    
    def get_character_info(self, character_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a character"""
        if character_name not in self.characters:
            return None
        
        character = self.characters[character_name]
        return {
            "name": character.name,
            "personality": character.personality,
            "voice_id": character.voice_id,
            "emotion_profile": character.emotion_profile,
            "speaking_style": character.speaking_style,
            "language": character.language
        }

# Example usage and character creation
async def create_sample_characters(voice_processor: AdvancedVoiceProcessor):
    """Create sample characters for demonstration"""
    
    # Professor AI - Intelligent and enthusiastic
    professor_ai = voice_processor.create_character(
        name="Professor AI",
        personality={
            "traits": ["intelligent", "enthusiastic", "helpful"],
            "speaking_style": "academic but friendly",
            "background": "AI researcher and educator"
        },
        voice_id="pNInz6obpgDQGcFmaJgB"  # Adam voice
    )
    
    # Assistant Bella - Friendly and helpful
    assistant_bella = voice_processor.create_character(
        name="Assistant Bella",
        personality={
            "traits": ["friendly", "helpful", "calm"],
            "speaking_style": "warm and approachable",
            "background": "AI assistant and guide"
        },
        voice_id="EXAVITQu4vr4xnSDxMaL"  # Bella voice
    )
    
    # Commander Charlie - Serious and authoritative
    commander_charlie = voice_processor.create_character(
        name="Commander Charlie",
        personality={
            "traits": ["serious", "authoritative", "professional"],
            "speaking_style": "commanding and clear",
            "background": "System commander and coordinator"
        },
        voice_id="VR6AewLTigWG4xSOukaG"  # Charlie voice
    )
    
    return [professor_ai, assistant_bella, commander_charlie]